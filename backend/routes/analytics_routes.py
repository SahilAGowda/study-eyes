"""
Analytics routes for user insights and reporting
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.database import db
from models.user import User
from models.session import StudySession
from models.analytics import UserAnalytics
from datetime import datetime, timedelta
from sqlalchemy import func, desc

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/dashboard/dev', methods=['GET'])
def get_dashboard_data_dev():
    """Get dashboard analytics data for development (no auth required)"""
    try:
        from datetime import datetime
        today = datetime.utcnow().date()
        
        # Return mock data for development
        mock_data = {
            'today': {
                'date': today.isoformat(),
                'total_sessions': 3,
                'total_study_time': 180,  # 3 hours in minutes
                'average_focus_percentage': 85.5,
                'average_attention_score': 78.2,
                'productivity_score': 82.1,
                'break_count': 4,
                'fatigue_level': 25.3,
                'blink_rate': 16.8,
                'posture_score': 88.7
            },
            'weekly': {
                'total_study_time': 1080,  # 18 hours
                'total_sessions': 21,
                'average_focus_percentage': 82.1,
                'productivity_score': 79.8
            },
            'active_session': None,  # No active session for dev
            'recent_sessions': [
                {
                    'id': 1,
                    'start_time': (datetime.utcnow() - timedelta(hours=2)).isoformat(),
                    'end_time': (datetime.utcnow() - timedelta(minutes=30)).isoformat(),
                    'duration': 90,
                    'status': 'completed',
                    'focus_percentage': 87.5,
                    'average_attention_score': 82.1,
                    'blink_rate': 15.2,
                    'posture_score': 90.1,
                    'fatigue_level': 22.0,
                    'break_count': 2,
                    'is_active': False
                },
                {
                    'id': 2,
                    'start_time': (datetime.utcnow() - timedelta(hours=6)).isoformat(),
                    'end_time': (datetime.utcnow() - timedelta(hours=4)).isoformat(),
                    'duration': 120,
                    'status': 'completed',
                    'focus_percentage': 78.3,
                    'average_attention_score': 75.8,
                    'blink_rate': 18.7,
                    'posture_score': 85.4,
                    'fatigue_level': 35.2,
                    'break_count': 3,
                    'is_active': False
                }
            ]
        }
        
        return jsonify(mock_data), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch dashboard data', 'details': str(e)}), 500

@analytics_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_data():
    """Get dashboard analytics data"""
    try:
        user_id = get_jwt_identity()
        today = datetime.utcnow().date()
        
        # Get today's analytics
        today_analytics = UserAnalytics.query.filter_by(
            user_id=user_id, 
            date=today
        ).first()
        
        if not today_analytics:
            today_analytics = UserAnalytics(user_id=user_id, date=today)
            db.session.add(today_analytics)
            today_analytics.calculate_daily_metrics()
        
        # Get current active session
        active_session = StudySession.query.filter_by(
            user_id=user_id, 
            is_active=True
        ).first()
        
        # Get this week's data
        week_start = today - timedelta(days=today.weekday())
        week_analytics = UserAnalytics.get_weekly_analytics(user_id, week_start)
        
        # Calculate weekly totals
        weekly_totals = {
            'total_study_time': sum([a['total_study_time'] for a in week_analytics]),
            'total_sessions': sum([a['total_sessions'] for a in week_analytics]),
            'average_focus_percentage': sum([a['average_focus_percentage'] for a in week_analytics]) / len(week_analytics) if week_analytics else 0,
            'productivity_score': sum([a['productivity_score'] for a in week_analytics]) / len(week_analytics) if week_analytics else 0
        }
        
        # Get recent sessions
        recent_sessions = StudySession.query.filter_by(
            user_id=user_id
        ).order_by(desc(StudySession.start_time)).limit(5).all()
        
        return jsonify({
            'today': today_analytics.to_dict(),
            'weekly': weekly_totals,
            'active_session': active_session.to_dict() if active_session else None,
            'recent_sessions': [session.to_dict() for session in recent_sessions]
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch dashboard data', 'details': str(e)}), 500

@analytics_bp.route('/daily', methods=['GET'])
@jwt_required()
def get_daily_analytics():
    """Get daily analytics with date range"""
    try:
        user_id = get_jwt_identity()
        
        # Query parameters
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        days = request.args.get('days', 7, type=int)  # Default last 7 days
        
        # Set date range
        if date_from and date_to:
            try:
                start_date = datetime.fromisoformat(date_from).date()
                end_date = datetime.fromisoformat(date_to).date()
            except ValueError:
                return jsonify({'error': 'Invalid date format'}), 400
        else:
            end_date = datetime.utcnow().date()
            start_date = end_date - timedelta(days=days-1)
        
        # Get analytics data
        analytics = UserAnalytics.query.filter(
            UserAnalytics.user_id == user_id,
            UserAnalytics.date >= start_date,
            UserAnalytics.date <= end_date
        ).order_by(UserAnalytics.date).all()
        
        # Fill missing dates with empty data
        date_range = []
        current_date = start_date
        while current_date <= end_date:
            date_range.append(current_date)
            current_date += timedelta(days=1)
        
        analytics_dict = {a.date: a for a in analytics}
        
        result = []
        for date in date_range:
            if date in analytics_dict:
                result.append(analytics_dict[date].to_dict())
            else:
                # Create empty analytics for missing dates
                empty_analytics = UserAnalytics(user_id=user_id, date=date)
                result.append(empty_analytics.to_dict())
        
        return jsonify({
            'analytics': result,
            'date_range': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch daily analytics', 'details': str(e)}), 500

@analytics_bp.route('/weekly', methods=['GET'])
@jwt_required()
def get_weekly_analytics():
    """Get weekly analytics"""
    try:
        user_id = get_jwt_identity()
        
        # Query parameters
        weeks = request.args.get('weeks', 4, type=int)  # Default last 4 weeks
        
        weekly_data = []
        
        for i in range(weeks):
            # Calculate week start date
            today = datetime.utcnow().date()
            week_start = today - timedelta(days=today.weekday() + (i * 7))
            
            # Get weekly analytics
            week_analytics = UserAnalytics.get_weekly_analytics(user_id, week_start)
            
            # Calculate weekly totals
            if week_analytics:
                weekly_totals = {
                    'week_start': week_start.isoformat(),
                    'total_study_time': sum([a['total_study_time'] for a in week_analytics]),
                    'total_sessions': sum([a['total_sessions'] for a in week_analytics]),
                    'completed_sessions': sum([a['completed_sessions'] for a in week_analytics]),
                    'average_focus_percentage': sum([a['average_focus_percentage'] for a in week_analytics]) / len(week_analytics),
                    'productivity_score': sum([a['productivity_score'] for a in week_analytics]) / len(week_analytics),
                    'total_breaks': sum([a['total_breaks'] for a in week_analytics])
                }
            else:
                weekly_totals = {
                    'week_start': week_start.isoformat(),
                    'total_study_time': 0,
                    'total_sessions': 0,
                    'completed_sessions': 0,
                    'average_focus_percentage': 0,
                    'productivity_score': 0,
                    'total_breaks': 0
                }
            
            weekly_data.append(weekly_totals)
        
        # Reverse to show oldest to newest
        weekly_data.reverse()
        
        return jsonify({
            'weekly_analytics': weekly_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch weekly analytics', 'details': str(e)}), 500

@analytics_bp.route('/monthly', methods=['GET'])
@jwt_required()
def get_monthly_analytics():
    """Get monthly analytics"""
    try:
        user_id = get_jwt_identity()
        
        # Query parameters
        year = request.args.get('year', type=int)
        month = request.args.get('month', type=int)
        
        if not year or not month:
            now = datetime.utcnow()
            year = now.year
            month = now.month
        
        # Get monthly analytics
        monthly_analytics = UserAnalytics.get_monthly_analytics(user_id, year, month)
        
        # Calculate monthly totals
        if monthly_analytics:
            monthly_totals = {
                'year': year,
                'month': month,
                'total_study_time': sum([a['total_study_time'] for a in monthly_analytics]),
                'total_sessions': sum([a['total_sessions'] for a in monthly_analytics]),
                'completed_sessions': sum([a['completed_sessions'] for a in monthly_analytics]),
                'average_focus_percentage': sum([a['average_focus_percentage'] for a in monthly_analytics]) / len(monthly_analytics),
                'productivity_score': sum([a['productivity_score'] for a in monthly_analytics]) / len(monthly_analytics),
                'total_breaks': sum([a['total_breaks'] for a in monthly_analytics]),
                'daily_breakdown': monthly_analytics
            }
        else:
            monthly_totals = {
                'year': year,
                'month': month,
                'total_study_time': 0,
                'total_sessions': 0,
                'completed_sessions': 0,
                'average_focus_percentage': 0,
                'productivity_score': 0,
                'total_breaks': 0,
                'daily_breakdown': []
            }
        
        return jsonify(monthly_totals), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch monthly analytics', 'details': str(e)}), 500

@analytics_bp.route('/insights', methods=['GET'])
@jwt_required()
def get_insights():
    """Get personalized insights and recommendations"""
    try:
        user_id = get_jwt_identity()
        
        # Get recent analytics (last 30 days)
        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=30)
        
        analytics = UserAnalytics.query.filter(
            UserAnalytics.user_id == user_id,
            UserAnalytics.date >= start_date,
            UserAnalytics.date <= end_date
        ).all()
        
        if not analytics:
            return jsonify({
                'insights': [],
                'recommendations': ['Start tracking your study sessions to get personalized insights!']
            }), 200
        
        insights = []
        recommendations = []
        
        # Calculate averages
        avg_focus = sum([a.average_focus_percentage for a in analytics]) / len(analytics)
        avg_productivity = sum([a.productivity_score for a in analytics]) / len(analytics)
        total_study_time = sum([a.total_study_time for a in analytics])
        total_sessions = sum([a.total_sessions for a in analytics])
        
        # Focus insights
        if avg_focus >= 80:
            insights.append("Excellent focus! You maintain high concentration during study sessions.")
        elif avg_focus >= 60:
            insights.append("Good focus levels. There's room for improvement in concentration.")
        else:
            insights.append("Focus needs attention. Consider reducing distractions in your study environment.")
            recommendations.append("Try the Pomodoro technique with shorter sessions and regular breaks.")
        
        # Productivity insights
        if avg_productivity >= 80:
            insights.append("Outstanding productivity! You're consistently meeting your study goals.")
        elif avg_productivity >= 60:
            insights.append("Solid productivity. You're on the right track with your study habits.")
        else:
            recommendations.append("Set smaller, achievable study goals to build momentum.")
        
        # Study time insights
        daily_avg = total_study_time / 30  # Average per day
        if daily_avg >= 120:  # 2+ hours
            insights.append("Great commitment! You're dedicating substantial time to studying.")
        elif daily_avg >= 60:  # 1+ hour
            insights.append("Good study routine. Consider increasing study time gradually.")
        else:
            recommendations.append("Try to establish a consistent daily study routine.")
        
        # Session completion insights
        if total_sessions > 0:
            completed_sessions = sum([a.completed_sessions for a in analytics])
            completion_rate = (completed_sessions / total_sessions) * 100
            
            if completion_rate >= 80:
                insights.append("Excellent session completion rate! You stick to your study plans well.")
            elif completion_rate >= 60:
                insights.append("Good session completion. Try to finish more sessions you start.")
            else:
                recommendations.append("Set more realistic session durations to improve completion rates.")
        
        # Break insights
        total_breaks = sum([a.total_breaks for a in analytics])
        if total_sessions > 0:
            breaks_per_session = total_breaks / total_sessions
            if breaks_per_session < 0.5:
                recommendations.append("Consider taking more breaks to maintain focus and prevent fatigue.")
            elif breaks_per_session > 3:
                recommendations.append("You might be taking too many breaks. Try longer focused sessions.")
        
        # Trend analysis
        if len(analytics) >= 7:
            recent_week = analytics[-7:]
            previous_week = analytics[-14:-7] if len(analytics) >= 14 else []
            
            if previous_week:
                recent_avg_focus = sum([a.average_focus_percentage for a in recent_week]) / len(recent_week)
                previous_avg_focus = sum([a.average_focus_percentage for a in previous_week]) / len(previous_week)
                
                if recent_avg_focus > previous_avg_focus + 5:
                    insights.append("Your focus has improved significantly this week!")
                elif recent_avg_focus < previous_avg_focus - 5:
                    insights.append("Your focus has decreased this week. Consider what might be affecting concentration.")
        
        # General recommendations
        if not recommendations:
            recommendations.append("Keep up the great work! Your study habits are on track.")
        
        return jsonify({
            'insights': insights,
            'recommendations': recommendations,
            'summary_stats': {
                'average_focus_percentage': round(avg_focus, 2),
                'average_productivity_score': round(avg_productivity, 2),
                'total_study_time_hours': round(total_study_time / 60, 1),
                'total_sessions': total_sessions,
                'daily_average_minutes': round(daily_avg, 1)
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to generate insights', 'details': str(e)}), 500

@analytics_bp.route('/export', methods=['GET'])
@jwt_required()
def export_analytics():
    """Export analytics data as CSV"""
    try:
        user_id = get_jwt_identity()
        
        # Query parameters
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        format_type = request.args.get('format', 'json')  # json or csv
        
        # Set default date range (last 30 days)
        if not date_from or not date_to:
            end_date = datetime.utcnow().date()
            start_date = end_date - timedelta(days=30)
        else:
            try:
                start_date = datetime.fromisoformat(date_from).date()
                end_date = datetime.fromisoformat(date_to).date()
            except ValueError:
                return jsonify({'error': 'Invalid date format'}), 400
        
        # Get analytics data
        analytics = UserAnalytics.query.filter(
            UserAnalytics.user_id == user_id,
            UserAnalytics.date >= start_date,
            UserAnalytics.date <= end_date
        ).order_by(UserAnalytics.date).all()
        
        data = [a.to_dict() for a in analytics]
        
        if format_type == 'csv':
            # Convert to CSV format
            import csv
            import io
            
            output = io.StringIO()
            if data:
                writer = csv.DictWriter(output, fieldnames=data[0].keys())
                writer.writeheader()
                writer.writerows(data)
            
            csv_data = output.getvalue()
            output.close()
            
            return jsonify({
                'data': csv_data,
                'format': 'csv',
                'filename': f'study_analytics_{start_date}_{end_date}.csv'
            }), 200
        else:
            return jsonify({
                'data': data,
                'format': 'json',
                'date_range': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat()
                }
            }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to export analytics', 'details': str(e)}), 500
