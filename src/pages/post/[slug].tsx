import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';
import styles from './post.module.scss';
import Header from '../../components/Header';
import { UtterancesComments } from '../../components/Comments';
import ExitPreviewButton from '../../components/ExitPreviewButton';

interface Post {
  uid: string;
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  preview: boolean;
  nextPost: {
    slug: string;
    title: string;
  };
  previousPost: {
    slug: string;
    title: string;
  };
}

export default function Post({
  post,
  preview,
  nextPost,
  previousPost,
}: PostProps): JSX.Element {
  const router = useRouter();

  const wordsInPost = post?.data.content.reduce((acc, group) => {
    const wordsQuantityInHeading = group.heading.trim().split(/\s+/).length;
    const wordsQuantityInBody = RichText.asText(group.body).trim().split(/\s+/)
      .length;
    return acc + wordsQuantityInHeading + wordsQuantityInBody;
  }, 0);

  const readingTime = Math.ceil(wordsInPost / 200);

  return (
    <>
      <Head>
        <title>{post?.data.title} | spacetraveling</title>
      </Head>
      <Header />
      {router.isFallback ? (
        <p>Carregando...</p>
      ) : (
        <>
          <section>
            <figure className={styles.bannerContainer}>
              <img src={post?.data.banner.url} alt="banner" />
            </figure>
            <main className={styles.content}>
              <h1>{post?.data.title}</h1>
              <div>
                <time>
                  <FiCalendar />
                  {format(
                    new Date(post?.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </time>
                <address>
                  <FiUser />
                  {post?.data.author}
                </address>
                <time>
                  <FiClock />
                  {readingTime} min
                </time>
              </div>
              <article className={styles.article}>
                {post?.data.content.map(group => (
                  <div key={group.heading}>
                    <h2>{group.heading}</h2>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: RichText.asHtml(group.body),
                      }}
                    />
                  </div>
                ))}
              </article>
            </main>
          </section>
          <nav className={styles.navigation}>
            <div>
              {previousPost && (
                <>
                  <p>{previousPost.title}</p>
                  <Link href={`/post/${previousPost.slug}`}>
                    <a>Post anterior</a>
                  </Link>
                </>
              )}
            </div>
            <div>
              {nextPost && (
                <>
                  <p>{nextPost.title}</p>
                  <Link href={`/post/${nextPost.slug}`}>
                    <a>Próximo post</a>
                  </Link>
                </>
              )}
            </div>
          </nav>
          <UtterancesComments />
          {preview && <ExitPreviewButton />}
        </>
      )}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.Predicates.at('document.type', 'postc')],
    {
      fetch: ['postc.title', 'postc.subtitle', 'postc.author'],
      pageSize: 1,
    }
  );

  return {
    paths: posts.results.map(post => ({ params: { slug: post.uid } })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();

  const { slug } = params;

  const {
    id,
    uid,
    first_publication_date,
    data,
    last_publication_date,
  } = await prismic.getByUID('postc', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const nextPostResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'postc')],
    {
      fetch: ['postc.title'],
      pageSize: 1,
      ref: previewData?.ref ?? null,
      orderings: '[document.last_publication_date]',
      after: id,
    }
  );

  const previousPostResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'postc')],
    {
      fetch: ['postc.title'],
      pageSize: 1,
      ref: previewData?.ref ?? null,
      orderings: '[document.last_publication_date desc]',
      after: id,
    }
  );

  console.log(nextPostResponse);
  console.log(previousPostResponse);

  const post = {
    uid,
    first_publication_date,
    last_publication_date,
    data: {
      title: data.title,
      subtitle: data.subtitle,
      banner: {
        url: data.banner.url,
      },
      author: data.author,
      content: data.content,
    },
  };

  const nextPost = nextPostResponse.results.length
    ? {
        slug: nextPostResponse.results[0].uid,
        title: nextPostResponse.results[0].data.title,
      }
    : null;

  const previousPost = previousPostResponse.results.length
    ? {
        slug: previousPostResponse.results[0].uid,
        title: previousPostResponse.results[0].data.title,
      }
    : null;

  return {
    props: { post, preview, nextPost, previousPost },
  };
};
