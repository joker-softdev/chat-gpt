
# MongoDB connection configuration
import pymongo
import sys
from db_setup.mongodb.db_setup import connection_string, DB_NAME, COLLECTION_NAME, CHAT_LOGS_COLLECTION_NAME

try:
  client = pymongo.MongoClient(connection_string)
  
# return a friendly error if a URI error is thrown 
except pymongo.errors.ConfigurationError:
  print("An Invalid URI host error was received.")
  sys.exit(1)


db = client[DB_NAME]
def db_add_chat_log(log_data):
  collection = db[CHAT_LOGS_COLLECTION_NAME]
  collection.insert_one(log_data)




def db_get_all_data_for_chat(username, chat_id):
  collection = db[CHAT_LOGS_COLLECTION_NAME]

  filter_query = { "id": chat_id, "header": 0, "user": username }
  filtered_data = collection.find(filter_query)
  
  response_data = []
  for document in filtered_data:
    new_data = {}
    new_data["id"] = document["id"]
    new_data["question"] = document["question"]
    new_data["answer"] = document["answer"]
    response_data.append(new_data)

  return response_data




def db_get_chat_list(username):
  collection = db[CHAT_LOGS_COLLECTION_NAME]

  filter_query = { "header": 1, "user": username }
  filtered_data = collection.find(filter_query)

  response_data = []
  previous_datetime = ''
  for document in filtered_data:
    new_data = {}
    new_data["id"] = document["id"]

    if previous_datetime != document["datetime"]:
      new_data["datetime"] = document["datetime"]

    previous_datetime = document["datetime"]
    response_data.append(new_data)

  return response_data


def db_get_maximum_sub_id(chat_id):
  collection = db[CHAT_LOGS_COLLECTION_NAME]
  max_value_document = collection.find_one(sort=[("subid", -1)])
  max_value = max_value_document["subid"]

  return max_value


def db_create_new_chat(username, datetime):
  collection = db[CHAT_LOGS_COLLECTION_NAME]

  filter_query = { "header": 1, "user": username }
  filtered_data = collection.find(filter_query)

  new_id = 0
  for data in filtered_data:
     if data["id"] > new_id:
      new_id = data["id"]
     
  new_id += 1

  newLog = {}
  newLog["id"] = new_id
  newLog["user"] = username
  newLog["datetime"] = datetime
  newLog["question"] = ""
  newLog["answer"] = ""
  newLog["header"] = 1
  
  db_add_chat_log(newLog)
  return new_id
      

def db_remove_chat(username, chat_id):
  collection = db[CHAT_LOGS_COLLECTION_NAME]

  query_multiple = {"user": username, 'id': chat_id }
  result_multiple = collection.delete_many(query_multiple)

  result_multiple = 'success'
  return result_multiple