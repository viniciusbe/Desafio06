import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';

import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { useRouter } from 'next/router';
import commonStyles from '../../styles/common.module.scss';
import { getPrismicClient } from '../../services/prismic';
import styles from './post.module.scss';
import Header from '../../components/Header';

interface Post {
  uid: string;
  first_publication_date: string | null;
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
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  // const readingTime = post.data.content.reduce(group =>

  //   , [])

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>
      <Header />
      {router.isFallback ? (
        <p>Carregando...</p>
      ) : (
        <section className={styles.container}>
          <figure className={styles.bannerContainer}>
            <img src={post.data.banner.url} alt="banner" />
          </figure>
          <main className={styles.content}>
            <h1>{post.data.title}</h1>
            <div>
              <time>
                <FiCalendar />
                {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
              </time>
              <address>
                <FiUser />
                {post.data.author}
              </address>
              <time>
                <FiClock />4 min
              </time>
            </div>
            <article className={styles.article}>
              {post.data.content.map(group => (
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

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();

  const { slug } = context.params;

  const { uid, first_publication_date, data } = await prismic.getByUID(
    'postc',
    String(slug),
    {}
  );

  // console.log(data.content[0]);

  const post = {
    uid,
    first_publication_date,
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

  console.log(JSON.stringify(data, null, 2));

  return {
    props: { post },
  };
};
