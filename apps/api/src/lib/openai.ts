import OpenAI from 'openai';
import { env } from '../config';

export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

/**
 * Wrapper for OpenAI chat completions with built-in error handling.
 * All AI calls should go through this function — never import OpenAI directly in modules.
 */
export async function createChatCompletion(params: {
  model: 'gpt-4o' | 'gpt-4o-mini';
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  maxTokens: number;
  temperature?: number;
  responseFormat?: OpenAI.Chat.Completions.ChatCompletionCreateParams['response_format'];
}): Promise<{ content: string; tokensUsed: number }> {
  try {
    const completion = await openai.chat.completions.create({
      model: params.model,
      messages: params.messages,
      max_tokens: params.maxTokens,
      temperature: params.temperature ?? 0.7,
      response_format: params.responseFormat,
    });

    const content = completion.choices[0]?.message?.content ?? '';
    const tokensUsed = completion.usage?.total_tokens ?? 0;

    return { content, tokensUsed };
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error(`OpenAI API Error: ${error.status} - ${error.message}`);
      throw new Error(`AI service temporarily unavailable: ${error.message}`);
    }
    throw error;
  }
}
