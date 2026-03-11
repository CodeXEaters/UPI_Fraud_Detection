from sqlalchemy import Column, Integer, String, Float, Text
from app.database.db import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)

    upi_id = Column(String, index=True)

    amount = Column(Float)
    device_id = Column(String)
    location = Column(String)

    transaction_type = Column(String)

    prediction = Column(String)
    risk_score = Column(Integer)


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    upi_id = Column(String, index=True)
    scam_type = Column(String)
    description = Column(Text)
    screenshot = Column(String, nullable=True)