import firestoreIndexes from '../firestore.indexes.json';
describe('firestore.indexes.json', () => {
  it('should have a valid structure', () => {
    expect(firestoreIndexes).toBeInstanceOf(Object);
    expect(Array.isArray(firestoreIndexes.indexes)).toBe(true);
    expect(Array.isArray(firestoreIndexes.fieldOverrides)).toBe(true);
  });
});
