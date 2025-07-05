const item = $input.all()[0];

if (item.json.hasOwnProperty('query')) {
  try {
    // First parse: converts the escaped JSON string to a regular string
    const parsed = JSON.parse(item.json.query);
    // If the result is a string and looks like JSON, parse it again
    if (typeof parsed === 'string' && (parsed.startsWith('[') || parsed.startsWith('{'))) {
      const parsedJson = JSON.parse(parsed);
      // If it's an array with one element, return that element directly
      if (Array.isArray(parsedJson) && parsedJson.length === 1) {
        return [{ json: parsedJson[0] }];
      }
      return [{ json: parsedJson }];
    }
    return [{ json: parsed }];
  } catch (error) {
    // If parsing fails, return the original query content
    return [{ json: item.json.query }];
  }
}

// If the input itself is an array with one element, return that element
if (Array.isArray(item.json) && item.json.length === 1) {
  return [{ json: item.json[0] }];
}

return [{ json: item.json }];