import { WidgetProps } from 'types/widget'

export const withUserToken = (userToken?: WidgetProps['userToken']) => ({
  headers: {
    Authorization: `Bearer ${userToken}`,
  },
})

export const replaceLinksWithTags2 = (message: string) => {
  const regex = /https:\/\/\S+/g
  return message.replace(regex, '<a href="$&" style="text-decoration: underline" target="_blank">$&</a>')
}

export function replaceLinksWithTags(text: string): string {
  // Regular expressions for detecting URLs, images, and bold text
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const imageRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i
  const boldRegex = /\*\*(.*?)\*\*/g

  let formattedText = text.replace(urlRegex, (url) => {
    if (imageRegex.test(url)) {
      // If the URL is an image, render it as an <img> tag with controlled size
      return `<img src="${url}" alt="image" style="max-width: 100%; max-height: 300px; height: auto; border-radius: 8px; margin-top: 8px; margin-bottom: 8px;" />`
    } else {
      // Otherwise, render it as a clickable link with "View Listing"
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #1a73e8;">View Listing</a>`
    }
  })
  
  // Replace **bold** text with <strong> tags
  formattedText = formattedText.replace(boldRegex, '<strong>$1</strong>')

  // Replace line breaks with <br> tags to preserve list formatting
  formattedText = formattedText.replace(/\n/g, '<br>')

  return formattedText
}
