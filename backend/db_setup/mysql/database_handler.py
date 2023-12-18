
# MongoDB connection configuration
import mysql.connector
import sys
from db_setup.mysql.db_setup import host, user, password, dbname, tablemame

try:
  connection = mysql.connector.connect(
      host=host,
      user=user,
      password=password,
  )

  # Create a cursor to interact with the database
  cursor = connection.cursor()
  cursor.execute(f"CREATE DATABASE IF NOT EXISTS {dbname}")
  cursor.execute(f"use {dbname}")
  cursor.execute(f"CREATE TABLE IF NOT EXISTS {tablemame} (_id INT AUTO_INCREMENT PRIMARY KEY, id INT, user VARCHAR(50) NOT NULL, datetime VARCHAR(50) NOT NULL, question TEXT, answer TEXT, header TINYINT)")

except mysql.connector.Error as err:
    print(f"Error: {err}")



def db_add_chat_log(log_data):
  insert_query = f"INSERT INTO {tablemame} (id, user, datetime, question, answer, header) VALUES (%s, %s, %s, %s, %s, %s)"
  data_to_insert = (log_data["id"], log_data["user"], log_data["datetime"], log_data["question"], log_data["answer"], log_data["header"])
  cursor.execute(insert_query, data_to_insert)

  connection.commit()



def db_get_all_data_for_chat(username, chat_id):
  select_query = f"SELECT * FROM {tablemame} where id = {chat_id} and header = 0 and user = {username}"
  cursor.execute(select_query)
  filtered_data = cursor.fetchall()
  
  response_data = []
  for document in filtered_data:
    new_data = {}
    new_data["id"] = document["id"]
    new_data["question"] = document["question"]
    new_data["answer"] = document["answer"]
    response_data.append(new_data)

  return response_data



def db_get_chat_list(username):
  select_query = f"SELECT id, datetime FROM {tablemame} where header = 1 and user = {username}"
  cursor.execute(select_query)
  filtered_data = cursor.fetchall()

  print(filtered_data)
  response_data = []
  previous_datetime = ''
  for document in filtered_data:
    new_data = {}
    new_data["id"] = document[0]

    if previous_datetime != document[1]:
      new_data["datetime"] = document[1]

    previous_datetime = document[1]
    response_data.append(new_data)

  return response_data



def db_create_new_chat(username, datetime):
  select_query = f"SELECT * FROM {tablemame} where header = 1 and user = {username}"
  cursor.execute(select_query)

  new_id = 0
  rows = cursor.fetchall()
  for row in rows:
      if row["id"] > new_id:
        new_id = row["id"]

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