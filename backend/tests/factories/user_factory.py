import factory
from faker import Faker
from app.models.user import User
from app.core.security import AuthService

fake = Faker()

class UserFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = User
        sqlalchemy_session = None  # Session is provided by a fixture
        sqlalchemy_session_persistence = "commit"

    id = factory.Sequence(lambda n: n + 1)
    email = factory.LazyAttribute(lambda _: fake.email())
    username = factory.LazyAttribute(lambda _: fake.user_name())
    full_name = factory.LazyAttribute(lambda _: fake.name())
    hashed_password = factory.LazyFunction(lambda: AuthService.get_password_hash("password"))
    is_active = True
    is_superuser = False
