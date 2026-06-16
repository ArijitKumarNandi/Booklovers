export const genreTree = [
  { name: 'Action', children: [{ name: 'Military Action' }, { name: 'Spy Action' }, { name: 'Martial Arts' }] },
  { name: 'Adventure', children: [{ name: 'Survival' }, { name: 'Exploration' }, { name: 'Sea Adventure' }, { name: 'Quest' }] },
  { name: 'Anthology', children: [{ name: 'Short Stories' }, { name: 'Essays' }, { name: 'Poetry Collections' }] },
  { name: 'Art', children: [{ name: 'Art History' }, { name: 'Drawing' }, { name: 'Painting' }, { name: 'Design' }] },
  { name: 'Biography', children: [{ name: 'Memoir' }, { name: 'Autobiography' }, { name: 'Political Biography' }, { name: 'Literary Biography' }] },
  { name: 'Business', children: [{ name: 'Entrepreneurship' }, { name: 'Marketing' }, { name: 'Finance' }, { name: 'Leadership' }] },
  { name: 'Children', children: [{ name: 'Picture Books' }, { name: 'Early Readers' }, { name: 'Middle Grade' }, { name: 'Moral Stories' }] },
  { name: 'Classics', children: [{ name: 'Ancient Classics' }, { name: 'Modern Classics' }, { name: 'Classic Literature' }] },
  { name: 'Comics', children: [{ name: 'Graphic Novels' }, { name: 'Manga' }, { name: 'Superhero Comics' }] },
  { name: 'Crime', children: [{ name: 'Detective' }, { name: 'Noir' }, { name: 'True Crime' }, { name: 'Legal Thriller' }] },
  { name: 'Drama', children: [{ name: 'Family Drama' }, { name: 'Social Drama' }, { name: 'Tragedy' }] },
  { name: 'Education', children: [{ name: 'Study Guides' }, { name: 'Exam Prep' }, { name: 'Teaching' }, { name: 'Reference' }] },
  { name: 'Fantasy', children: [{ name: 'Epic Fantasy' }, { name: 'Urban Fantasy' }, { name: 'Dark Fantasy' }, { name: 'Magic School' }] },
  { name: 'Fiction', children: [{ name: 'Literary Fiction' }, { name: 'Contemporary Fiction' }, { name: 'Coming of Age' }, { name: 'Satire' }] },
  { name: 'Health', children: [{ name: 'Fitness' }, { name: 'Nutrition' }, { name: 'Mental Health' }, { name: 'Medical' }] },
  { name: 'Historical Fiction', children: [{ name: 'War Fiction' }, { name: 'Period Drama' }, { name: 'Alternate History' }] },
  { name: 'History', children: [{ name: 'Ancient History' }, { name: 'Medieval History' }, { name: 'Modern History' }, { name: 'Indian History' }] },
  { name: 'Horror', children: [{ name: 'Supernatural Horror' }, { name: 'Psychological Horror' }, { name: 'Gothic Horror' }, { name: 'Monster Horror' }] },
  { name: 'Humor', children: [{ name: 'Comedy' }, { name: 'Parody' }, { name: 'Comic Essays' }] },
  { name: 'Mystery', children: [{ name: 'Cozy Mystery' }, { name: 'Police Procedural' }, { name: 'Whodunit' }] },
  { name: 'Nature', children: [{ name: 'Wildlife' }, { name: 'Environment' }, { name: 'Travel Nature' }, { name: 'Botany' }] },
  { name: 'Philosophy', children: [{ name: 'Ethics' }, { name: 'Logic' }, { name: 'Eastern Philosophy' }, { name: 'Western Philosophy' }] },
  { name: 'Poetry', children: [{ name: 'Lyric Poetry' }, { name: 'Narrative Poetry' }, { name: 'Spoken Word' }] },
  { name: 'Religion', children: [{ name: 'Mythology' }, { name: 'Spirituality' }, { name: 'Comparative Religion' }] },
  { name: 'Romance', children: [{ name: 'Contemporary Romance' }, { name: 'Historical Romance' }, { name: 'Paranormal Romance' }] },
  { name: 'Science', children: [{ name: 'Physics' }, { name: 'Chemistry' }, { name: 'Biology' }, { name: 'Astronomy' }] },
  { name: 'Science Fiction', children: [{ name: 'Space Opera' }, { name: 'Cyberpunk' }, { name: 'Dystopian' }, { name: 'Time Travel' }] },
  { name: 'Self Help', children: [{ name: 'Productivity' }, { name: 'Habits' }, { name: 'Mindfulness' }, { name: 'Motivation' }] },
  { name: 'Technology', children: [{ name: 'Programming' }, { name: 'Artificial Intelligence' }, { name: 'Cybersecurity' }, { name: 'Data Science' }] },
  { name: 'Thriller', children: [{ name: 'Psychological Thriller' }, { name: 'Political Thriller' }, { name: 'Medical Thriller' }, { name: 'Conspiracy' }] },
]

export const flattenGenreTree = (nodes = genreTree, parentPath = []) => {
  return nodes.flatMap((node) => {
    const path = [...parentPath, node.name]
    return [
      { name: node.name, path, label: path.join(' > ') },
      ...flattenGenreTree(node.children ?? [], path),
    ]
  })
}

export const getRootGenres = (paths = []) => {
  return [...new Set(paths.map((path) => path.split(' > ')[0]).filter(Boolean))]
}

export const getSubgenres = (paths = []) => {
  return [...new Set(paths.flatMap((path) => path.split(' > ').slice(1)).filter(Boolean))]
}

export const getBookGenrePaths = (book) => {
  if(book?.genrePaths?.length) return book.genrePaths
  if(book?.genres?.length) return book.genres
  return book?.category ? [book.category] : []
}

export const getBookGenreLabels = (book) => getBookGenrePaths(book)

export const getBookGenreDisplayLabels = (book) => {
  return [...new Set(getBookGenreLabels(book).map((label) => label.split(' > ').pop()).filter(Boolean))]
}

export const matchesGenreFilter = (book, selectedGenre) => {
  if(!selectedGenre) return true
  const needle = selectedGenre.toLowerCase()
  return getBookGenrePaths(book).some((path) => path.toLowerCase().split(' > ').includes(needle))
}
