"""OpenAI-compatible embeddings that send raw text instead of tiktoken token IDs.

langchain-openai 0.0.8's embed_documents sends tiktoken token IDs as the
embedding input when chunking is enabled. The real OpenAI API tolerates token
IDs, but other OpenAI-compatible endpoints (e.g. DashScope) reject them with
HTTP 400. Our texts are short (table representations, questions), so chunking
is unnecessary.
"""

from langchain_openai import OpenAIEmbeddings


class TextOpenAIEmbeddings(OpenAIEmbeddings):
    def embed_documents(self, texts, chunk_size=None):
        texts = list(texts)
        if not texts:
            return []
        response = self.client.create(input=texts, **self._invocation_params)
        if not isinstance(response, dict):
            response = response.model_dump()
        return [r["embedding"] for r in response["data"]]

    def embed_query(self, text):
        return self.embed_documents([text])[0]
