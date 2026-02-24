'use client';

const DOG_API_URL = 'https://api.thedogapi.com/v1';
const CAT_API_URL = 'https://api.thecatapi.com/v1';
const DOG_API_KEY = 'live_IyHPXzddXK0zlgFtu03GopEJJoWH9Exmrc4dXTDYImZ3Y5gZKTf9HEo4iEQ7FlU6';
const CAT_API_KEY = 'live_2A6Y9cTRxOuFOKROkb30lRZgzmsmkDunPVvePaG9S6ASR5qdRxSEDxSNzxDJ0n4B';

export async function fetchBreeds(species: 'dog' | 'cat') {
    const url = species === 'dog' ? `${DOG_API_URL}/breeds` : `${CAT_API_URL}/breeds`;
    const key = species === 'dog' ? DOG_API_KEY : CAT_API_KEY;

    try {
        const res = await fetch(url, {
            headers: { 'x-api-key': key }
        });
        if (!res.ok) throw new Error('Failed to fetch breeds');
        const data = await res.json();
        return data.map((b: any) => b.name);
    } catch (err) {
        console.error(err);
        return [];
    }
}
