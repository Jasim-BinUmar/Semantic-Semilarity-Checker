import torch
from transformers import BertTokenizer, BertModel
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import sys

tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

source_text = sys.argv[1]
target_text_1 = sys.argv[2]


# Tokenize the texts
source_tokens = tokenizer.encode_plus(source_text, padding=True, truncation=True, return_tensors='pt')
target_tokens_1 = tokenizer.encode_plus(target_text_1, padding=True, truncation=True, return_tensors='pt')


model = BertModel.from_pretrained('bert-base-uncased')

# Generate embeddings for source text
with torch.no_grad():
    source_outputs = model(source_tokens['input_ids'], attention_mask=source_tokens['attention_mask'])
    source_embeddings = source_outputs.last_hidden_state.squeeze(0).numpy()

# Generate embeddings for target texts
with torch.no_grad():
    target_outputs_1 = model(target_tokens_1['input_ids'], attention_mask=target_tokens_1['attention_mask'])
    target_embeddings_1 = target_outputs_1.last_hidden_state.squeeze(0).numpy()


# Apply mean pooling to obtain fixed-size representations
source_embedding_mean = np.mean(source_embeddings, axis=0)
target_embedding_1_mean = np.mean(target_embeddings_1, axis=0)


# Reshape the arrays to 2D
source_embedding_mean = source_embedding_mean.reshape(1, -1)
target_embedding_1_mean = target_embedding_1_mean.reshape(1, -1)


# Calculate cosine similarity between source and target texts
similarity_score_1 = cosine_similarity(source_embedding_mean, target_embedding_1_mean)[0][0]


        
print("Bert's Similarity Score:", similarity_score_1*100)

