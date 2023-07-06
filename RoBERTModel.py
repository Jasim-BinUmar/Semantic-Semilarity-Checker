import torch
from transformers import RobertaTokenizer, RobertaModel
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import sys

tokenizer = RobertaTokenizer.from_pretrained('roberta-base')
model = RobertaModel.from_pretrained('roberta-base')

text1 = sys.argv[1]
text2 = sys.argv[2]

# Tokenize the texts
text1_tokens = tokenizer.encode_plus(text1, padding=True, truncation=True, return_tensors='pt')
text2_tokens = tokenizer.encode_plus(text2, padding=True, truncation=True, return_tensors='pt')

# Generate embeddings for text 1
with torch.no_grad():
    text1_outputs = model(text1_tokens['input_ids'], attention_mask=text1_tokens['attention_mask'])
    text1_embeddings = text1_outputs.last_hidden_state.squeeze(0).numpy()

# Generate embeddings for text 2
with torch.no_grad():
    text2_outputs = model(text2_tokens['input_ids'], attention_mask=text2_tokens['attention_mask'])
    text2_embeddings = text2_outputs.last_hidden_state.squeeze(0).numpy()

# Apply mean pooling to obtain fixed-size representations
text1_embedding_mean = np.mean(text1_embeddings, axis=0)
text2_embedding_mean = np.mean(text2_embeddings, axis=0)

# Reshape the arrays to 2D
text1_embedding_mean = text1_embedding_mean.reshape(1, -1)
text2_embedding_mean = text2_embedding_mean.reshape(1, -1)

# Calculate cosine similarity between the texts
similarity_score = cosine_similarity(text1_embedding_mean, text2_embedding_mean)[0][0]


print("RoBert's Similarity Score:", similarity_score*100)
