type contentFromDocument = {
  type: string;
  text?: string;
  href?: string;
  content?: contentFromDocument[];
}

type flatContent = Omit<contentFromDocument, 'content'> & {
  id: string;
  parentContent: string | null;
};

export type blockFromDocument = {
    id: string;
    type: string;
    props: any;
    content: any[];
    children?: blockFromDocument[];
};
  
export type flatBlock = Omit<blockFromDocument, 'children'> & { parentId: string | null };

function generateId(): string {
  return crypto.randomUUID(); // or use any custom ID generator
}


function flattenContent(content: contentFromDocument[], contentId: string | null = null, result: flatContent[] = []): flatContent[] {
  if (Array.isArray(content)) 
    for (const item of content) {
        const { content: children, ...rest } = item;
        const id = generateId();
        result.push({id, ...rest, parentContent: contentId });
    
        if (Array.isArray(children) && children.length > 0) {
          flattenContent(children, id, result);
        }
    }
    
  return result;
}  

export function flattenBlocks(blocks: blockFromDocument[], parentId: string | null = null, result: flatBlock[] = []): flatBlock[] {
  for (const block of blocks) {
    const { children, content, ...rest } = block;
    const flatContent = flattenContent(content);
    result.push({ ...rest, parentId, content: flatContent });

    if (Array.isArray(children) && children.length > 0) {
      flattenBlocks(children, block.id, result);
    }
  }

  return result;
}


/*****************************************  Unflatten  */

export function unflattenBlocks(flatBlocks: flatBlock[]): blockFromDocument[] {
  const blockMap = new Map<string, blockFromDocument>();
  const rootBlocks: blockFromDocument[] = [];

  // First, create all blocks without children
  for (const flat of flatBlocks) {
    blockMap.set(flat.id, {
      id: flat.id,
      type: flat.type,
      props: flat.props,
      content: [], // will be filled later
      children: [],
    });
  }

  // Then, assign children and content
  for (const flat of flatBlocks) {
    const block = blockMap.get(flat.id)!;

    // Reconstruct content tree
    block.content = unflattenContent(flat.content);

    if (flat.parentId) {
      const parent = blockMap.get(flat.parentId);
      parent?.children?.push(block);
    } else {
      rootBlocks.push(block);
    }
  }

  return rootBlocks;
}

function unflattenContent(flatContent: flatContent[]): contentFromDocument[] {
  const contentMap = new Map<string, contentFromDocument>();
  const rootContent: contentFromDocument[] = [];

  // Create all content items
  for (const flat of flatContent) {
    contentMap.set(flat.id, {
      type: flat.type,
      text: flat.text,
      href: flat.href,
      content: [],
    });
  }

  // Assign children
  for (const flat of flatContent) {
    const item = contentMap.get(flat.id)!;

    if (flat.parentContent) {
      const parent = contentMap.get(flat.parentContent);
      parent?.content?.push(item);
    } else {
      rootContent.push(item);
    }
  }

  return rootContent;
}

