

export const findComment = async (analysisResult) => {
  for await (const {data: comments} of octokit.paginate.iterator( octokit.rest.issues.listComments, parameters )) {
        // Search each page for the comment
        const comment = comments.find(comment =>
          findCommentPredicate(inputs, comment)
        )
        if (comment) return comment
      }
  }
