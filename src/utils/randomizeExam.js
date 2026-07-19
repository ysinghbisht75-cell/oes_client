function shuffleItems(items) {
  const shuffled = [...items]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const currentItem = shuffled[index]
    shuffled[index] = shuffled[swapIndex]
    shuffled[swapIndex] = currentItem
  }

  return shuffled
}

export function randomizeExamQuestions(questions) {
  return shuffleItems(questions).map((question) => ({
    ...question,
    randomizedOptions: shuffleItems(
      question.options.map((option, originalIndex) => ({
        originalIndex,
        text: option,
      })),
    ),
  }))
}
