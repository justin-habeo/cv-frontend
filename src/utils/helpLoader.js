export async function loadHelpContent(helpFilePath) {
  try {
    const response = await fetch(helpFilePath);
    if (!response.ok) {
      throw new Error('Failed to load help content');
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading help content:', error);
    return 'Help content not available.';
  }
}
