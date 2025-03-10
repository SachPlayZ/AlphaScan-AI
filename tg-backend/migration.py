from pymongo import MongoClient

def migrate_logs():
    # Connect to MongoDB
    client = MongoClient('mongodb+srv://test:test@alchtest.nwkli.mongodb.net')
    db = client['web3test']
    logs_collection = db['logs']

    try:
        # Update all documents to add user_id field
        result = logs_collection.update_many(
            {}, # Match all documents
            {'$set': {'user_id': '0x2F8110491E604ADCBdF50F5f100CDd46FFbeb344'}} # Set user_id field to "testId"
        )
        
        print(f"Successfully updated {result.modified_count} documents")
        
    except Exception as e:
        print(f"Error during migration: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    migrate_logs()
