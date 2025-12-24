import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Environment, FileSystemLoader
from dotenv import load_dotenv

load_dotenv()

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', 587))
        self.smtp_username = os.getenv('SMTP_USERNAME')
        self.smtp_password = os.getenv('SMTP_PASSWORD')
        self.sender_email = os.getenv('SENDER_EMAIL', 'noreply@studyeyes.com')
        self.app_url = os.getenv('APP_URL', 'http://localhost:3000')
        
        # Set up Jinja2 environment for email templates
        self.env = Environment(
            loader=FileSystemLoader('templates/emails'),
            autoescape=True
        )
    
    def send_email(self, to_email, subject, html_content, text_content=None):
        """Send an email with HTML content"""
        if not all([self.smtp_username, self.smtp_password]):
            print("SMTP credentials not configured. Email not sent.")
            return False
            
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"Study Eyes <{self.sender_email}>"
        msg['To'] = to_email
        
        # Attach both HTML and plain text versions
        part1 = MIMEText(text_content, 'plain') if text_content else MIMEText(html_content, 'html')
        part2 = MIMEText(html_content, 'html')
        
        msg.attach(part1)
        msg.attach(part2)
        
        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            return True
        except Exception as e:
            print(f"Error sending email: {str(e)}")
            return False
    
    def send_verification_email(self, to_email, username, verification_link):
        """Send email verification email"""
        template = self.env.get_template('verify_email.html')
        subject = "Verify Your Email - Study Eyes"
        
        html_content = template.render(
            username=username,
            verification_link=verification_link,
            app_url=self.app_url
        )
        
        return self.send_email(
            to_email=to_email,
            subject=subject,
            html_content=html_content
        )
    
    def send_password_reset_email(self, to_email, username, reset_link):
        """Send password reset email"""
        template = self.env.get_template('reset_password.html')
        subject = "Reset Your Password - Study Eyes"
        
        html_content = template.render(
            username=username,
            reset_link=reset_link,
            app_url=self.app_url
        )
        
        return self.send_email(
            to_email=to_email,
            subject=subject,
            html_content=html_content
        )

# Create a singleton instance
email_service = EmailService()
