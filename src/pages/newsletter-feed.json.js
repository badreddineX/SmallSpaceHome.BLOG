import { getCollection } from 'astro:content';

// Machine-readable feed consumed by the newsletter broadcast job
// (api/broadcast.js): recent posts + the weekly-idea queue. Public, but only
// exposes what's already on the blog.
export async function GET(context) {
  const site = context.site?.toString().replace(/\/$/, '') || 'https://smallspacehome.ca';

  // Email images: the ~60KB /images/thumb/ webp variant (960px — crisp at the
  // ~448px it renders), same one the post cards use. Raw originals are 5-6000px.
  const emailImg = (img) =>
    img && !img.startsWith('http')
      ? `${site}${img.replace('/images/', '/images/thumb/').replace(/\.(jpe?g|png)$/i, '.webp')}`
      : img || null;

  const posts = (await getCollection('blog'))
    .sort((a, b) => new Date(b.data.datePublished) - new Date(a.data.datePublished))
    .slice(0, 25)
    .map((post) => ({
      title: post.data.title,
      description: post.data.description,
      url: `${site}/blog/${post.id}`,
      image: emailImg(post.data.image),
      category: post.data.category,
      datePublished: post.data.datePublished,
      dateModified: post.data.dateModified,
    }));

  let ideas = [];
  try {
    ideas = (await getCollection('ideas'))
      .sort((a, b) => a.data.order - b.data.order)
      .map((idea) => ({
        slug: idea.id,
        order: idea.data.order,
        title: idea.data.title,
        body: idea.body?.trim() || '',
        price: idea.data.price || null,
        image: emailImg(idea.data.image),
        relatedUrl: idea.data.relatedPost ? `${site}/blog/${idea.data.relatedPost}` : null,
      }));
  } catch {
    // No ideas collection yet — fine, the digest just runs post-only.
  }

  return new Response(JSON.stringify({ generatedAt: new Date().toISOString(), posts, ideas }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=600',
    },
  });
}
