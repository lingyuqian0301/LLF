import pandas as pd
import os

data_dir = '../../data/datasets/'

#load all csv files from data directory
items = pd.read_csv(os.path.join(data_dir, 'items.csv'))
keywords = pd.read_csv(os.path.join(data_dir, 'keywords.csv'))
merchants = pd.read_csv(os.path.join(data_dir, 'merchants.csv'))
transaction_data = pd.read_csv(os.path.join(data_dir, 'transaction_data.csv'))
transaction_items = pd.read_csv(os.path.join(data_dir, 'transaction_items.csv'))

