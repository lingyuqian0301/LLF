from models.sales_forecast import SalesForecaster
from models.customer_segments import CustomerSegmentation
import pandas as pd
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def train_models(merchant_id):
    logger.info(f"Starting model training for merchant {merchant_id}")
    
    # Load data
    merchant_data = pd.read_csv(f"data/merchant_{merchant_id}_transactions.csv")
    merchant_data['order_time'] = pd.to_datetime(merchant_data['order_time'])
    
    # Train sales forecaster
    forecaster = SalesForecaster()
    forecast_metrics = forecaster.train(merchant_data)
    logger.info(f"Sales forecast model metrics: {forecast_metrics}")
    
    # Train customer segmentation
    segmentation = CustomerSegmentation()
    segment_analysis = segmentation.train(merchant_data)
    logger.info(f"Customer segments identified: {len(segment_analysis)}")
    
    return {
        'forecast_metrics': forecast_metrics,
        'segment_analysis': segment_analysis
    }

if __name__ == "__main__":
    import sys
    merchant_id = sys.argv[1] if len(sys.argv) > 1 else None
    if merchant_id:
        train_models(merchant_id)
    else:
        print("Please provide merchant_id as argument")