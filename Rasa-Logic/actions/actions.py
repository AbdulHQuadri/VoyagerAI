# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/custom-actions


# This is a simple example for a custom action which utters "Hello World!"

# from typing import Any, Text, Dict, List
#
# from rasa_sdk import Action, Tracker
# from rasa_sdk.executor import CollectingDispatcher
#
#
# class ActionHelloWorld(Action):
#
#     def name(self) -> Text:
#         return "action_hello_world"
#
#     def run(self, dispatcher: CollectingDispatcher,
#             tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#         dispatcher.utter_message(text="Hello World!")
#
#         return []


from typing import Any, Text, Dict, List
from pymongo.mongo_client import MongoClient
import json
import random
import os
from rasa_sdk.events import SlotSet
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher 
from googletrans import Translator 
import mysql.connector
from mysql.connector import pooling
from optimum.onnxruntime import ORTModelForCausalLM


# uri = "mongodb+srv://quadriabdul18:upJQOMgyGBmJZrII@odyssey-lesson-data.gcu1o.mongodb.net/?retryWrites=true&w=majority&appName=Odyssey-Lesson-Data"
# client = MongoClient(uri)


# def get_response_from_db(intent):
#     response_data = responses_collection.find_one({"intent": intent})
#     if response_data:
#         return random.choice(response_data["responses"])
#     return "Sorry, I don't have a response for that."


# class ActionConfirmOrder(Action):
#     def name(self) -> Text: 
#         return "action_confirm_order"
    
#     def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain:Dict[Text,Any]) -> List[Dict[Text,Any]]:
#         ordered_item = tracker.get_slot("ordered_item")

#         if ordered_item:
#             dispatcher.utter_message(text=f"Great choice! I'll get your {ordered_item} ready.")
#         else:
#             dispatcher.utter_message(text=f"Sorry, I didn't catch that, what did you order?")
        
#         return []

# class ActionRetrieveNotes(Action):
#     def name(self): 
#         return "action_retrieve_notes"
    
#     def run(self, dispatcher, tracker, domain):
#         file_path = os.path.join(os.path.dirname(__file__), "../data/language_notes.json")
#         with open(file_path, "r" ,encoding="utf-8") as f:
#             data = json.load(f)
        
#         # Get the intent of the user input 
#         intent  = tracker.latest_message["intent"]["name"]

#         if intent in data:
#             examples = random.sample(data[intent]["spanish"], 3)

#             response =  "\n\n".join(
#                 [f"**{ex['phrase']}** ({ex['meaning']}): {ex['explanation']}" for ex in examples]
#             )
#         else:
#             # If notes don't exist, ask user if they would like a translation of phrase
#             dispatcher.utter_message(
#                 text="Sorry, I don't have notes on that. I do have the feature to translate phrases? (Might not be 100 percent accurate!)"
#             )
        
#         dispatcher.utter_message(text=response)
#         return []


# class ActionTranslatePhrase(Action):
#     def name(self):
#         return "action_translate_phrase"
#     def run(self, dispatcher, tracker, domain):
#         translator = Translator()

#         phrase = tracker.get_slot("phrase")
        
#         if not phrase:
#             dispatcher.utter_message(text="I didn't get that. Could you repeat the phrase please?")
#             return []
        
#         translated_text = translator.translate(phrase, src="en", dest="es").text

#         response = f"The translation is **{translated_text}** (Note: This translation might not be 100% accurate.)"
#         dispatcher.utter_message(text=response)
#         return [] 

# Database Management
import mysql.connector.pooling
import json
import os

class DatabaseManager:
    file_path = os.path.join(os.path.dirname(__file__), "../data/database_config.json")
    def __init__(self, config_path=file_path):
        self.config = self.load_config(config_path)
        self.connection_pool = self.create_connection_pool()
    
    def load_config(self, config_path):
        try:
            with open(config_path, "r") as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Config file not found: {config_path}")
            return {}
        except json.JSONDecodeError:
            print(f"Invalid JSON in config file: {config_path}")
            return {}

    def create_connection_pool(self):
        try:
            pool = mysql.connector.pooling.MySQLConnectionPool(
                pool_name="voyager_pool",
                **self.config
            )
            print("Database connection pool created successfully")
            return pool
        except Exception as e:
            print(f"Error creating database connection pool: {str(e)}")
            return None

    def get_connection(self):
        if self.connection_pool:
            return self.connection_pool.get_connection()
        return None

    def execute_query(self, query, params=None):
        conn = self.get_connection()
        if not conn:
            return None

        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(query, params)
            result = cursor.fetchall() if cursor.description else None
            conn.commit()
            cursor.close()
            return result
        except Exception as e:
            print(f"Database query error: {str(e)}")
            return None
        finally:
            conn.close()

    def fetch_one(self, query, params=None):
        conn = self.get_connection()
        if not conn:
            return None

        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(query, params)
            result = cursor.fetchone()
            cursor.close()
            return result
        except Exception as e:
            print(f"Database query error: {str(e)}")
            return None
        finally:
            conn.close()

## LLM Settings
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import json

class LLMManager:
    file_path = os.path.join(os.path.dirname(__file__), "../data/llm_config.json")
    def __init__(self, config_path=file_path):
        self.config = self.load_config(config_path)
        self.model_loaded = False
        self.load_model()

    def load_config(self, config_path):
        try:
            with open(config_path, "r") as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Config file not found: {config_path}")
            return {}
        except json.JSONDecodeError:
            print(f"Invalid JSON in config file: {config_path}")
            return {}

    def load_model(self):
        try:
            print("Loading TinyLlama model (this may take a moment)...")
            self.tokenizer = AutoTokenizer.from_pretrained(self.config["model_path"])
            self.model = AutoModelForCausalLM.from_pretrained(
                self.config["model_path"],
                torch_dtype=torch.float32,
                low_cpu_mem_usage=True,
            )
            self.model.eval()
            print("TinyLlama model loaded successfully")
            self.model_loaded = True
        except Exception as e:
            print(f"Failed to load model: {str(e)}")

    def generate_response(self, user_input):
        if not self.model_loaded:
            return "LLM is not available at the moment."
        try:
            prompt = f"<|system|>\nYou are a friendly and helpful taxi driver. You give concise, helpful responses using casual language. You're knowledgeable about local routes, traffic conditions, and nearby establishments.\n<|user|>\n{user_input}\n<|assistant|>\n"
            inputs = self.tokenizer(prompt, return_tensors="pt")
            with torch.no_grad():
                outputs = self.model.generate(
                    inputs.input_ids,
                    max_new_tokens=self.config["max_new_tokens"],
                    temperature=self.config["temperature"],
                    top_p=self.config["top_p"],
                    top_k=self.config["top_k"],
                    do_sample=True,
                    pad_token_id=self.tokenizer.eos_token_id,
                    eos_token_id=self.tokenizer.eos_token_id,
                    repetition_penalty=self.config["repetition_penalty"],
                )
            response_tokens = outputs[0][inputs.input_ids.shape[1]:]
            generated_text = self.tokenizer.decode(response_tokens, skip_special_tokens=True)
            return generated_text
        except Exception as e:
            return f"I'm sorry, I couldn't process that: {str(e)}"
        

# Action class
class ActionResponseAction(Action):
    def __init__(self):
        self.off_track_count = 0
        self.db_manager = DatabaseManager()
        self.llm_manager = LLMManager()

    def name(self):
        return "action_response_action"

    def get_user_data(self, user_id):
        query = "SELECT native_language, learning_language, proficiency_level FROM users WHERE user_id = %s"
        user_data = self.db_manager.fetch_one(query, (user_id,))
        return user_data or {"native_language": "en", "learning_language": "es", "proficiency_level": "beginner"}

    def get_lesson_data(self, lesson_code, stage_code):
        lesson_query = "SELECT lesson_id FROM lessons WHERE lesson_code = %s AND is_active = TRUE"
        lesson_row = self.db_manager.fetch_one(lesson_query, (lesson_code,))
        if not lesson_row:
            return None, []

        lesson_id = lesson_row["lesson_id"]
        stage_query = "SELECT * FROM lesson_stages WHERE lesson_id = %s AND stage_code = %s"
        stage_data = self.db_manager.fetch_one(stage_query, (lesson_id, stage_code))
        if not stage_data:
            return None, []

        intent_query = "SELECT intent_code FROM stage_intents WHERE stage_id = %s"
        intent_rows = self.db_manager.execute_query(intent_query, (stage_data["stage_id"],))
        expected_intents = [row["intent_code"] for row in intent_rows]
        return stage_data, expected_intents

    def get_random_response(self, intent, language_code):
        response_query = "SELECT response_text FROM responses WHERE intent_code = %s AND language_code = %s ORDER BY RAND() LIMIT 1"
        response_row = self.db_manager.fetch_one(response_query, (intent, language_code))
        if response_row:
            return response_row["response_text"]
        elif language_code != "en":
            return self.get_random_response(intent, "en")
        else:
            return f"I don't have a response for {intent}"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        try:
            user_input = tracker.latest_message.get("text", "")
            intent = tracker.latest_message["intent"]["name"]
            metadata = tracker.latest_message.get("metadata", {})
            lesson_name = metadata.get("lesson_name", "taxi_to_hotel")
            current_intent = metadata.get("current_intent", "start")
            user_id = metadata.get("user_id", 2)
            language = self.get_user_data(user_id).get("learning_language", "en").lower()
            stage_data, expected_intents = self.get_lesson_data(lesson_name, current_intent)

            if stage_data and intent in expected_intents:
                response = self.get_random_response(intent, language)
                self.off_track_count = 0
                dispatcher.utter_message(text=response)
                return []
            else:
                self.off_track_count += 1
                llm_response = self.llm_manager.generate_response(user_input)
                if self.off_track_count >= 3 and expected_intents:
                    hint = f"Hint: Try one of these intents: {', '.join(expected_intents)}"
                    llm_response += f"\n\n{hint}"
                dispatcher.utter_message(text=llm_response)
                return []
        except Exception as e:
            print(f"Error in action response: {str(e)}")
            dispatcher.utter_message(text=f"Error processing message: {str(e)}")
            return []
    
    