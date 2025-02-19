import axios from "axios";

export async function writeToNotion({
    notionId,  
    accessToken,
    text,
    isDatabase = false, 
    title,
    properties = {} 
}: {
    notionId: string;
    accessToken: string;
    text: string;
    isDatabase?: boolean;
    title?:string
    properties?: any;
}) {
    try {
        if (isDatabase) {
            const notionUrl = "https://api.notion.com/v1/pages";

            const response = await axios.post(
                notionUrl,
                {
                    parent: { database_id: notionId },
                    properties: {
                        "Title": {
                            title: [{ text: { content: title  } }]
                        },
                        ...properties // Merge additional properties dynamically
                    }
                },
                {
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Notion-Version": "2022-06-28",
                        "Content-Type": "application/json"
                    }
                }
            );

            console.log("Added row to database:", response.data);
            return response.data;
        } else {
            const notionUrl = `https://api.notion.com/v1/blocks/${notionId}/children`;

            const response = await axios.patch(
                notionUrl,
                {
                    children: [
                        {
                            object: "block",
                            type: "paragraph",
                            paragraph: {
                                rich_text: [{ type: "text", text: { content: text } }]
                            }
                        }
                    ]
                },
                {
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Notion-Version": "2022-06-28",
                        "Content-Type": "application/json"
                    }
                }
            );

            console.log("Text added to page:", response.data);
            return response.data;
        }
    } catch (error) {
        // @ts-ignore
        console.error(" Error:", error.response?.data || error);
        throw error;
    }
}
