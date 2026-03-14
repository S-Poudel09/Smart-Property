import joblib
import numpy as np
import os

# load trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "loan_model.pkl")

model = joblib.load(MODEL_PATH)


def predict_loan(age, income, credit_score, loan_amount, loan_term, employment_status):

    # convert employment status to number
    if employment_status.lower() == "employed":
        employment = 1
    else:
        employment = 0

    data = np.array([[age, income, credit_score, loan_amount, loan_term, employment]])

    prediction = model.predict(data)

    return prediction[0]