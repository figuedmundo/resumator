import argparse
from app.core.database import SessionLocal
from app.models.user import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_user(username, email, password):
    db = SessionLocal()
    try:
        if db.query(User).filter(User.email == email).first():
            print(f"Error: User with email {email} already exists.")
            return
        hashed_password = pwd_context.hash(password)
        user = User(username=username, email=email, hashed_password=hashed_password, is_active=True)
        db.add(user)
        db.commit()
        print(f"Successfully created user: {username}")
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create a user.")
    parser.add_argument("--username", required=True)
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    args = parser.parse_args()
    create_user(args.username, args.email, args.password)
