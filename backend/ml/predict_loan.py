import joblib
import numpy as np
import os

# load trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "loan_model.pkl")

_model = None

def get_model():
    global _model
    if _model is None:
        if os.path.exists(MODEL_PATH):
            try:
                _model = joblib.load(MODEL_PATH)
            except Exception as e:
                print(f"Error loading model: {e}")
        else:
            print(f"Model file not found at {MODEL_PATH}")
    return _model

def is_model_loaded():
    return get_model() is not None

def predict_loan(age, income, credit_score, loan_amount, loan_term, employment_status):
    model = get_model()
    if model is None:
        return 0 # Default to rejection if model missing

    # convert employment status to number
    # Mapping based on typical training: Employed=1, others=0
    employment = 1 if employment_status.lower() == "employed" else 0

    data = np.array([[age, income, credit_score, loan_amount, loan_term, employment]])

    try:
        prediction = model.predict(data)
        return prediction[0]
    except Exception as e:
        print(f"Prediction error: {e}")
        return 0