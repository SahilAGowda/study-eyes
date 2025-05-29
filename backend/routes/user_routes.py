"""
User routes for user management and profile operations
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.database import db
from models.user import User
from models.session import StudySession
from models.analytics import UserAnalytics
from datetime import datetime, timedelta

user_bp = Blueprint('users', __name__)

@user_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    """Get detailed user profile with statistics"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user statistics
        total_sessions = StudySession.query.filter_by(user_id=user_id).count()
        completed_sessions = StudySession.query.filter_by(
            user_id=user_id, 
            status='completed'
        ).count()
        
        # Get total study time (all time)
        sessions = StudySession.query.filter_by(user_id=user_id).all()
        total_study_minutes = sum([s.actual_duration or 0 for s in sessions])
        
        # Get recent analytics
        recent_analytics = UserAnalytics.query.filter_by(
            user_id=user_id
        ).order_by(UserAnalytics.date.desc()).limit(7).all()
        
        avg_focus = 0
        if recent_analytics:
            avg_focus = sum([a.average_focus_percentage for a in recent_analytics]) / len(recent_analytics)
        
        # Calculate streak (consecutive days with sessions)
        current_streak = 0
        check_date = datetime.utcnow().date()
        
        while True:
            day_analytics = UserAnalytics.query.filter_by(
                user_id=user_id,
                date=check_date
            ).first()
            
            if day_analytics and day_analytics.total_sessions > 0:
                current_streak += 1
                check_date -= timedelta(days=1)
            else:
                break
        
        profile_data = user.to_dict()
        profile_data.update({
            'statistics': {
                'total_sessions': total_sessions,
                'completed_sessions': completed_sessions,
                'completion_rate': (completed_sessions / total_sessions * 100) if total_sessions > 0 else 0,
                'total_study_hours': round(total_study_minutes / 60, 1),
                'average_focus_percentage': round(avg_focus, 2),
                'current_streak_days': current_streak,
                'member_since': user.created_at.isoformat()
            }
        })
        
        return jsonify({'user': profile_data}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch user profile', 'details': str(e)}), 500

@user_bp.route('/preferences', methods=['PUT'])
@jwt_required()
def update_preferences():
    """Update user preferences"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update preferences
        if 'default_session_duration' in data:
            duration = data['default_session_duration']
            if 5 <= duration <= 480:  # 5 minutes to 8 hours
                user.default_session_duration = duration
            else:
                return jsonify({'error': 'Session duration must be between 5 and 480 minutes'}), 400
        
        if 'break_duration' in data:
            duration = data['break_duration']
            if 1 <= duration <= 60:  # 1 to 60 minutes
                user.break_duration = duration
            else:
                return jsonify({'error': 'Break duration must be between 1 and 60 minutes'}), 400
        
        if 'focus_threshold' in data:
            threshold = data['focus_threshold']
            if 0.1 <= threshold <= 1.0:
                user.focus_threshold = threshold
            else:
                return jsonify({'error': 'Focus threshold must be between 0.1 and 1.0'}), 400
        
        if 'timezone' in data:
            user.timezone = data['timezone']
        
        if 'notification_enabled' in data:
            user.notification_enabled = data['notification_enabled']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Preferences updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update preferences', 'details': str(e)}), 500

@user_bp.route('/goals', methods=['GET'])
@jwt_required()
def get_user_goals():
    """Get user goals and targets"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Default goals (could be stored in user profile or separate table)
        goals = {
            'daily_study_minutes': 120,  # 2 hours
            'weekly_sessions': 5,
            'focus_percentage_target': 80,
            'streak_target': 7,  # 7 days
            'monthly_hours': 40
        }
        
        # Get current progress
        today = datetime.utcnow().date()
        today_analytics = UserAnalytics.query.filter_by(
            user_id=user_id,
            date=today
        ).first()
        
        week_start = today - timedelta(days=today.weekday())
        week_analytics = UserAnalytics.get_weekly_analytics(user_id, week_start)
        
        current_month = datetime.utcnow().month
        current_year = datetime.utcnow().year
        month_analytics = UserAnalytics.get_monthly_analytics(user_id, current_year, current_month)
        
        progress = {
            'daily_study_minutes': today_analytics.total_study_time if today_analytics else 0,
            'weekly_sessions': sum([a['total_sessions'] for a in week_analytics]),
            'current_focus_percentage': today_analytics.average_focus_percentage if today_analytics else 0,
            'current_streak': 0,  # Calculate streak
            'monthly_hours': sum([a['total_study_time'] for a in month_analytics]) / 60
        }
        
        # Calculate current streak
        current_streak = 0
        check_date = today
        
        while True:
            day_analytics = UserAnalytics.query.filter_by(
                user_id=user_id,
                date=check_date
            ).first()
            
            if day_analytics and day_analytics.total_sessions > 0:
                current_streak += 1
                check_date -= timedelta(days=1)
            else:
                break
        
        progress['current_streak'] = current_streak
        
        return jsonify({
            'goals': goals,
            'progress': progress
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch user goals', 'details': str(e)}), 500

@user_bp.route('/stats/summary', methods=['GET'])
@jwt_required()
def get_stats_summary():
    """Get comprehensive user statistics summary"""
    try:
        user_id = get_jwt_identity()
        
        # Get all-time statistics
        all_sessions = StudySession.query.filter_by(user_id=user_id).all()
        
        # Basic counts
        total_sessions = len(all_sessions)
        completed_sessions = len([s for s in all_sessions if s.status == 'completed'])
        total_study_time = sum([s.actual_duration or 0 for s in all_sessions])
        
        # Focus and productivity averages
        completed_with_focus = [s for s in all_sessions if s.status == 'completed' and s.focus_percentage > 0]
        avg_focus = sum([s.focus_percentage for s in completed_with_focus]) / len(completed_with_focus) if completed_with_focus else 0
        
        # Time-based statistics
        now = datetime.utcnow()
        this_week_start = now.date() - timedelta(days=now.weekday())
        this_month_start = now.date().replace(day=1)
        
        this_week_sessions = [s for s in all_sessions if s.start_time and s.start_time.date() >= this_week_start]
        this_month_sessions = [s for s in all_sessions if s.start_time and s.start_time.date() >= this_month_start]
        
        # Best day analysis
        daily_stats = {}
        for session in all_sessions:
            if session.start_time:
                date = session.start_time.date()
                if date not in daily_stats:
                    daily_stats[date] = {'sessions': 0, 'study_time': 0, 'focus_sum': 0, 'focus_count': 0}
                
                daily_stats[date]['sessions'] += 1
                daily_stats[date]['study_time'] += session.actual_duration or 0
                
                if session.focus_percentage > 0:
                    daily_stats[date]['focus_sum'] += session.focus_percentage
                    daily_stats[date]['focus_count'] += 1
        
        best_day = None
        max_study_time = 0
        for date, stats in daily_stats.items():
            if stats['study_time'] > max_study_time:
                max_study_time = stats['study_time']
                best_day = {
                    'date': date.isoformat(),
                    'study_time_minutes': stats['study_time'],
                    'sessions': stats['sessions'],
                    'average_focus': stats['focus_sum'] / stats['focus_count'] if stats['focus_count'] > 0 else 0
                }
        
        # Calculate current streak
        current_streak = 0
        check_date = now.date()
        
        while True:
            day_analytics = UserAnalytics.query.filter_by(
                user_id=user_id,
                date=check_date
            ).first()
            
            if day_analytics and day_analytics.total_sessions > 0:
                current_streak += 1
                check_date -= timedelta(days=1)
            else:
                break
        
        summary = {
            'all_time': {
                'total_sessions': total_sessions,
                'completed_sessions': completed_sessions,
                'completion_rate': (completed_sessions / total_sessions * 100) if total_sessions > 0 else 0,
                'total_study_hours': round(total_study_time / 60, 1),
                'average_focus_percentage': round(avg_focus, 2)
            },
            'this_week': {
                'sessions': len(this_week_sessions),
                'study_hours': round(sum([s.actual_duration or 0 for s in this_week_sessions]) / 60, 1)
            },
            'this_month': {
                'sessions': len(this_month_sessions),
                'study_hours': round(sum([s.actual_duration or 0 for s in this_month_sessions]) / 60, 1)
            },
            'streaks': {
                'current_streak_days': current_streak
            },
            'best_day': best_day,
            'achievements': []
        }
        
        # Add achievements
        if total_sessions >= 1:
            summary['achievements'].append('First Study Session')
        if total_sessions >= 10:
            summary['achievements'].append('Study Warrior')
        if total_sessions >= 50:
            summary['achievements'].append('Dedicated Learner')
        if total_sessions >= 100:
            summary['achievements'].append('Study Master')
        
        if total_study_time >= 60:  # 1 hour
            summary['achievements'].append('Hour of Power')
        if total_study_time >= 600:  # 10 hours
            summary['achievements'].append('Study Marathon')
        if total_study_time >= 3000:  # 50 hours
            summary['achievements'].append('Learning Legend')
        
        if current_streak >= 3:
            summary['achievements'].append('Consistency Champion')
        if current_streak >= 7:
            summary['achievements'].append('Week Warrior')
        if current_streak >= 30:
            summary['achievements'].append('Monthly Master')
        
        if avg_focus >= 80:
            summary['achievements'].append('Focus Expert')
        if avg_focus >= 90:
            summary['achievements'].append('Concentration King')
        
        return jsonify(summary), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch stats summary', 'details': str(e)}), 500

@user_bp.route('/delete', methods=['DELETE'])
@jwt_required()
def delete_account():
    """Delete user account and all associated data"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Confirm deletion with password
        data = request.get_json()
        if 'password' not in data:
            return jsonify({'error': 'Password confirmation required'}), 400
        
        if not user.check_password(data['password']):
            return jsonify({'error': 'Incorrect password'}), 401
        
        # Delete user (cascade will delete related data)
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({
            'message': 'Account deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete account', 'details': str(e)}), 500
