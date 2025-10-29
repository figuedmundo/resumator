import factory
from faker import Faker
from app.models.resume import Resume, ResumeVersion
from .user_factory import UserFactory

fake = Faker()

class ResumeVersionFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = ResumeVersion
        sqlalchemy_session = None
        sqlalchemy_session_persistence = "commit"

    id = factory.Sequence(lambda n: n + 1)
    markdown_content = factory.LazyAttribute(lambda _: fake.text())
    resume_id = factory.SubFactory("tests.factories.resume_factory.ResumeFactory")

class ResumeFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = Resume
        sqlalchemy_session = None
        sqlalchemy_session_persistence = "commit"

    id = factory.Sequence(lambda n: n + 1)
    title = factory.LazyAttribute(lambda _: fake.sentence())
    user_id = factory.SubFactory(UserFactory)
    versions = factory.RelatedFactoryList(ResumeVersionFactory, factory_related_name="resume", size=1)
