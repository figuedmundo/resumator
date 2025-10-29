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
    hashed_password = factory.LazyFunction(lambda: AuthService.hash_password("password"))
    is_active = True
