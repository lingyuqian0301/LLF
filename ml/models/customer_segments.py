from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import numpy as np

class CustomerSegmentation:
    def __init__(self, n_clusters=4):
        self.kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        self.scaler = StandardScaler()
        
    def prepare_features(self, customer_data):
        features = customer_data[[
            'order_frequency',
            'average_order_value',
            'total_items',
            'days_since_last_order'
        ]]
        return features
        
    def train(self, customer_data):
        features = self.prepare_features(customer_data)
        scaled_features = self.scaler.fit_transform(features)
        
        self.kmeans.fit(scaled_features)
        return self.analyze_clusters(features, self.kmeans.labels_)
    
    def analyze_clusters(self, features, labels):
        cluster_stats = []
        for i in range(len(np.unique(labels))):
            mask = labels == i
            stats = features[mask].mean().to_dict()
            stats['cluster_size'] = mask.sum()
            cluster_stats.append(stats)
        return cluster_stats