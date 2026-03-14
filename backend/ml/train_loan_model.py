import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
import joblib

# load dataset
df = pd.read_csv("../datasets/loans.csv")

# encode employment status
le = LabelEncoder()
df["Employment_Status"] = le.fit_transform(df["Employment_Status"])

# features
X = df[
    [
        "Age",
        "Income",
        "Credit_Score",
        "Loan_Amount",
        "Loan_Term",
        "Employment_Status",
    ]
]

# target
y = df["Loan_Approved"]

# split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# model
model = RandomForestClassifier()

model.fit(X_train, y_train)

# save model
joblib.dump(model, "loan_model.pkl")

print("Loan model trained and saved!")