import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

class SalesForecaster:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        
    def prepare_features(self, data):
        features = pd.DataFrame({
            'hour': data['order_time'].dt.hour,
            'day_of_week': data['order_time'].dt.dayofweek,
            'month': data['order_time'].dt.month,
            'recent_sales': data['sales_amount'].rolling(24).mean()
        }).fillna(0)
        return features
        
    def train(self, merchant_data):
        features = self.prepare_features(merchant_data)
        target = merchant_data['sales_amount']
        
        X_train, X_test, y_train, y_test = train_test_split(
            features, target, test_size=0.2, random_state=42
        )
        
        X_train_scaled = self.scaler.fit_transform(X_train)
        self.model.fit(X_train_scaled, y_train)
        
        return self.evaluate(X_test, y_test)
    
    def evaluate(self, X_test, y_test):
        X_test_scaled = self.scaler.transform(X_test)
        score = self.model.score(X_test_scaled, y_test)
        return {'r2_score': score}