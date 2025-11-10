import { pickRandom, withChances } from "./random-utils.ts"

const dict = {
  "adjectives": [
    "able", "ace", "aged", "amid", "bald", "blue", "bold", "calm", "cool", "damp",
    "dark", "deep", "dull", "easy", "even", "fair", "fast", "firm", "flat", "free",
    "full", "good", "gray", "just", "kind", "last", "near", "open", "pure", "rich",
    "slow", "soft", "tall", "true", "warm"
  ],
  "nouns": [
    "tree", "bird", "fish", "moon", "star", "rock", "wind", "fire", "rain", "snow",
    "ship", "wolf", "bear", "lion", "king", "farm", "road", "home", "city", "gold",
    "book", "door", "hand", "face", "time", "love", "game", "ring", "song", "wood",
    "cave", "corn", "mist", "lake", "deer"
  ],
  "prepositions": ["at", "by", "near", "with"]
}


export function generateRestaurantNames(): string[] {
  return dict.adjectives.map(adj => {
    return dict.nouns.map(noun => {
      const arr = withChances(25)
        ? [pickRandom(dict.prepositions) ,adj, noun]
        : [adj, noun]
      const str = arr.join(" ")
      return str[0].toUpperCase() + str.substring(1)
    })
  })
  .flat()
  .sort((l, r) => pickRandom([-1, 1]))
}
