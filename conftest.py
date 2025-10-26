import os

def pytest_sessionstart(session):
    """
    Set the TESTING environment variable before the test session starts.
    """
    print("Executing root conftest.py")
    os.environ["TESTING"] = "1"
