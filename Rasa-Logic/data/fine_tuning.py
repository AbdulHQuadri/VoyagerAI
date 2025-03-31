import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, Trainer, TrainingArguments
from transformers import DataCollatorForLanguageModeling
from datasets import Dataset
import json
import os
import numpy as np

print("Loading training examples...")
file_path = os.path.join(os.path.dirname(__file__), "training_data.json")
with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)
print(f"Loaded {len(data)} training examples")

# Initialize model and tokenizer
print("Loading base model")
model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# Add padding token if needed
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token
    model.config.pad_token_id = tokenizer.pad_token_id


print("Preparing training data...")
# Format the examples first
formatted_texts = []
for ex in data:
    # Format each example with system prompt, user input and assistant response
    text = f"<|system|>\nYou are a friendly and helpful taxi driver. You give concise, helpful responses using casual language. You're knowledgeable about local routes, traffic conditions, and nearby establishments.\n<|user|>\n{ex['input']}\n<|assistant|>\n{ex['response']}"
    formatted_texts.append(text)

# Create the dataset with just texts first
dataset = Dataset.from_dict({"text": formatted_texts})

# Tokenize everything at once
def tokenize_function(examples):
    tokenized = tokenizer(
        examples["text"],
        padding=False,  # We'll handle padding in the data collator
        truncation=True,
        max_length=1024,
        return_special_tokens_mask=True
    )
    return tokenized

tokenized_dataset = dataset.map(
    tokenize_function,
    batched=True,
    remove_columns=["text"]
)

# Create a proper data collator for language modeling
data_collator = DataCollatorForLanguageModeling(
    tokenizer=tokenizer,
    mlm=False  # We're doing causal language modeling, not masked
)

# Set up training arguments
output_dir = "./taxi_driver_tl2"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

training_args = TrainingArguments(
    output_dir=output_dir,
    num_train_epochs=3,
    per_device_train_batch_size=1,  # Small batch size for Phi-2
    gradient_accumulation_steps=4,  # Accumulate gradients to simulate larger batch
    warmup_steps=50,
    weight_decay=0.01,
    logging_dir=os.path.join(output_dir, 'logs'),
    logging_steps=10,
    save_strategy="epoch",
    learning_rate=2e-5,
    fp16=torch.cuda.is_available(),
    remove_unused_columns=False,  # Important for the data collator
)

# Initialize trainer with the proper data collator
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset,
    data_collator=data_collator,
)

# Train the model
print("Starting fine-tuning...")
trainer.train()

# Save the model
print(f"Saving fine-tuned model to {output_dir}")
model.save_pretrained(output_dir)
tokenizer.save_pretrained(output_dir)

print("Fine-tuning complete!")

# Test the model with a few examples
print("\nTesting the fine-tuned model:")
test_examples = [
    "How long will it take to get downtown?",
    "Do you know any good restaurants around here?",
    "What's the fastest route to the airport?",
    "Have you had a busy day today?"
]

# Load the fine-tuned model for testing
fine_tuned_tokenizer = AutoTokenizer.from_pretrained(output_dir)
fine_tuned_model = AutoModelForCausalLM.from_pretrained(output_dir)

for test_input in test_examples:
    # Format the input with the same format used in training
    prompt = f"<|system|>You are a friendly and helpful taxi driver.<|end|>\n<|user|>{test_input}<|end|>\n<|assistant|>"
    
    # Tokenize
    inputs = fine_tuned_tokenizer(prompt, return_tensors="pt")
    
    # Generate text
    with torch.no_grad():
        outputs = fine_tuned_model.generate(
            inputs.input_ids,
            max_new_tokens=50,
            temperature=0.7,
            top_p=0.9,
            do_sample=True,
            pad_token_id=fine_tuned_tokenizer.eos_token_id,
            early_stopping=True,
            repetition_penalty=1.2,
        )
    
    # Decode
    response_tokens = outputs[0][inputs.input_ids.shape[1]:]
    generated_text = fine_tuned_tokenizer.decode(response_tokens, skip_special_tokens=True)
    
    print(f"\nInput: {test_input}")
    print(f"Response: {generated_text}")