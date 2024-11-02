import { DateTime } from 'luxon'
import axios from 'axios'
import { store } from '../store'
import { endBotResponse, selectChatId, startBotResponse, streamBotResponse } from 'store/messages'
import ObjectID from 'bson-objectid'
import { t } from 'i18next'

export const createUserMessage = (message: string) => {
  return {
    text: message,
    sender: 'USER',
    messageType: 'text',
    ts: DateTime.now().toISO(),
  }
}


export const getBotResponseV2 = async ({ message, allMessages }: { message?: string; allMessages?: any[] }) => {
  const state = store.getState();
  const chatId = selectChatId(state);
  const botMessageId = String(ObjectID());
  const regexCurlyBracket = /{[^}]*}/;

  console.log("all", allMessages);

  try {
    // Dispatch to indicate the bot response has started
    store.dispatch(startBotResponse());

    // Send the POST request
    const { data: botResponse } = await axios.post(
      `/chats/${chatId}/answer`,
      {
        answer: message,
        allMessages: allMessages,  // Send message and allMessages in the body as JSON
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        responseType: 'stream',
        onDownloadProgress: (progressEvent) => {
          console.debug(progressEvent?.event?.currentTarget?.response);
          const partialResponse = progressEvent?.event?.currentTarget?.response;
          const responseWithoutIds = partialResponse.replace(regexCurlyBracket, '');
          store.dispatch(
            streamBotResponse({
              botMessageId,
              partialResponse: responseWithoutIds,
            })
          );
        },
      }
    );

    // Extract message IDs from the response for tracking
    const regexUserMessage = /'user_message':\s*'([^']*)'/;
    const userMessageMatch = botResponse.match(regexUserMessage);
    const userMessageId = userMessageMatch ? userMessageMatch[1] : null;

    const regexBotResponse = /'bot_response':\s*'([^']*)'/;
    const botResponseMatch = botResponse.match(regexBotResponse);
    const realBotMessageId = botResponseMatch ? botResponseMatch[1] : null;

    // Dispatch to indicate the bot response has ended
    store.dispatch(
      endBotResponse({
        botMessageId,
        botResponse: botResponse.replace(regexCurlyBracket, ''),
        botDatabaseId: realBotMessageId,
        userMessageId: userMessageId,
      })
    );

    return Promise.resolve(botResponse);
  } catch (error) {
    console.log('error occurred fetching bot response', error);
    return Promise.resolve(t('genericError'));
  }
};

export const getBotResponseV23 = async ({ message, allMessages}: { message?: string; allMessages?: any[] }) => {
  const state = store.getState()
  const chatId = selectChatId(state)
  const botMessageId = String(ObjectID())
  const regexCurlyBracket = /{[^}]*}/
  const jsonString = JSON.stringify(allMessages)
  console.log("all", allMessages)
  try {
    store.dispatch(startBotResponse())
    const { data: botResponse } = await axios.get(`chats/${chatId}/answer`, {
      params: {
        answer: message,
        jsonString,
      },
      headers: {
        'Content-Type': 'application/json',  // Explicitly set Content-Type
      },
      responseType: 'stream',
      onDownloadProgress: (progressEvent) => {
        console.debug(progressEvent?.event?.currentTarget?.response)
        const partialResponse = progressEvent?.event?.currentTarget?.response
        const responseWithoutIds = partialResponse.replace(regexCurlyBracket, '')
        store.dispatch(
          streamBotResponse({
            botMessageId,
            partialResponse: responseWithoutIds,
          }),
        )
      },
    })
    const regexUserMessage = /'user_message':\s*'([^']*)'/
    const userMessageMatch = botResponse.match(regexUserMessage)
    const userMessageId = userMessageMatch ? userMessageMatch[1] : null

    const regexBotResponse = /'bot_response':\s*'([^']*)'/
    const botResponseMatch = botResponse.match(regexBotResponse)
    const realBotMessageId = botResponseMatch ? botResponseMatch[1] : null
    store.dispatch(
      endBotResponse({
        botMessageId,
        botResponse: botResponse.replace(regexCurlyBracket, ''),
        botDatabaseId: realBotMessageId,
        userMessageId: userMessageId,
      }),
    )
    return Promise.resolve(botResponse)
  } catch (error) {
    console.log('error occurred fetching bot response', error)
    return Promise.resolve(t('genericError'))
  }
}
