from flask import Flask, request, jsonify, g
from datetime import datetime
from database_handler import db_add_chat_log, db_get_all_data_for_chat, db_get_chat_list, db_create_new_chat, db_remove_chat, db_get_maximum_sub_id
from flask_cors import CORS
from openai import OpenAI

MODEL_GPT_4 = "gpt-4"
MODEL_GPT_3_5 = "gpt-3.5-turbo"

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes in the app

client = OpenAI(
    # This is the default and can be omitted
    api_key= "replace openAI api key",
)

def get_completion(prompt):
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model=MODEL_GPT_3_5,
    )

    return chat_completion.choices[0].message.content


    # messages = [{"role": "user", "content": prompt}]
    # response = client.chat.completions.create(
    #     model=model,
    #     messages=messages,
    #     temperature=0,
    # )
    # return response.choices[0].message["content"]


app.config['current_chat_id'] = 0
@app.route('/', methods = ['GET', 'POST'])
def hello():
    return 'Hello! Welcome to the backend server of Tax Genii.'



@app.route("/api/ask-a-question", methods=['POST']) 
def ask_a_question():
    if request.method == 'POST': 
        username = request.json['username']
        prompt = request.json['prompt']
        response = get_completion(prompt)

        # Get current time
        current_time = datetime.now()
        formatted_time = current_time.strftime("%Y-%m-%d")

        current_chat_id = app.config['current_chat_id']
        if current_chat_id == 0:
            current_chat_id = db_create_new_chat(username, formatted_time)

        app.config['current_chat_id'] = current_chat_id



        # Adding new Chat log to Database
        newLog = {}
        newLog["id"] = current_chat_id
        newLog["user"] = username
        newLog["datetime"] = formatted_time
        newLog["question"] = prompt
        newLog["answer"] = response
        newLog["header"] = 0

        db_add_chat_log(newLog)

        return jsonify({'message': response}) 
    


@app.route("/api/get-all-chat", methods=['POST']) 
def get_all_chat():
    if request.method == 'POST': 
        username = request.json['username']
        chat_id = request.json['chat_id']
        response = db_get_all_data_for_chat(username, chat_id)

        app.config['current_chat_id'] = chat_id

        return jsonify({'message': response}) 



@app.route("/api/get-chat-list", methods=['POST']) 
def get_chat_list():
    if request.method == 'POST': 
        username = request.json['username']
        response = db_get_chat_list(username)
        print(response)
        return jsonify({'message': response, 'active_id': app.config['current_chat_id']}) 



@app.route("/api/create-new-chat", methods=['POST']) 
def create_new_chat():
    if request.method == 'POST': 
        username = request.json['username']

        current_time = datetime.now()
        formatted_time = current_time.strftime("%Y-%m-%d")
        response = db_create_new_chat(username, formatted_time)

        app.config['current_chat_id'] = response

        return jsonify({'message': response}) 
    


@app.route("/api/delete-chat", methods=['POST']) 
def delete_chat():
    if request.method == 'POST': 
        username = request.json['username']
        chat_id = request.json['chat_id']
        response = db_remove_chat(username, chat_id)

        app.config['current_chat_id'] = 0
        return jsonify({'message': response}) 


if __name__ == '__main__':
    app.run(debug=False)
