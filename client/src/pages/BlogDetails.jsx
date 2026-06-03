import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { blogs } from '../assets/data'

const BlogDetails = () => {
  const { id } = useParams()
  const blog = blogs.find((item) => item.id === id)

  if (!blog) {
    return (
      <div className='max-padd-container min-h-[60vh] py-16 pt-28'>
        <h1 className='bold-32'>Blog not found</h1>
        <Link to='/blog' className='mt-4 inline-block underline bold-14'>Back to blog</Link>
      </div>
    )
  }

  return (
    <article className='max-padd-container py-16 pt-28'>
      <Link to='/blog' className='underline bold-14'>Back to all blogs</Link>

      <div className='mt-6 overflow-hidden rounded-2xl bg-primary'>
        <img src={blog.image} alt={blog.title} className='h-[260px] w-full object-cover sm:h-[380px]' />
      </div>

      <div className='mx-auto mt-8 max-w-4xl'>
        <p className='medium-16 text-secondary'>{blog.category}</p>
        <h1 className='bold-40 mt-2'>{blog.title}</h1>
        <p className='mt-4 regular-18'>{blog.excerpt}</p>

        <div className='mt-8 grid gap-5'>
          {blog.essay.map((paragraph) => (
            <p key={paragraph} className='regular-16 leading-7'>{paragraph}</p>
          ))}
        </div>
      </div>
    </article>
  )
}

export default BlogDetails
