
import factory
from faker import Faker
from app.models.cover_letter import CoverLetter, CoverLetterVersion
from .user_factory import UserFactory

fake = Faker()

class CoverLetterVersionFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = CoverLetterVersion
        sqlalchemy_session = None
        sqlalchemy_session_persistence = "commit"

    id = factory.Sequence(lambda n: n + 1)
    markdown_content = factory.LazyAttribute(lambda _: fake.text())
    cover_letter_id = factory.SubFactory("tests.factories.cover_letter_factory.CoverLetterFactory")

class CoverLetterFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = CoverLetter
        sqlalchemy_session = None
        sqlalchemy_session_persistence = "commit"

    id = factory.Sequence(lambda n: n + 1)
    title = factory.LazyAttribute(lambda _: fake.sentence())
    user_id = factory.SubFactory(UserFactory)
    versions = factory.RelatedFactoryList(CoverLetterVersionFactory, factory_related_name="cover_letter", size=1)
