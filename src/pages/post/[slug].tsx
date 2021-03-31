import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';

import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';

import { FiCalendar, FiUser } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import commonStyles from '../../styles/common.module.scss';
import { getPrismicClient } from '../../services/prismic';
import styles from './post.module.scss';
import Header from '../../components/Header';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
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
  // const readingTime = post.data.content.reduce(group =>

  //   , [])

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>
      <Header />
      <section className={styles.container}>
        <figure className={styles.bannerContainer}>
          <img src={post.data.banner.url} alt="logo" />
        </figure>
        <main className={styles.content}>
          <h1>{post.data.title}</h1>
          <div>
            <time>
              <FiCalendar />
              {post.first_publication_date}
            </time>
            <address>
              <FiUser />
              {post.data.author}
            </address>
            <time />
          </div>
          <article />
        </main>
      </section>
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
    paths: [{ params: { slug: posts.results[0].uid } }],
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
    first_publication_date: format(
      new Date(first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    data: {
      title: data.title,
      banner: {
        url: data.banner.url,
      },
      author: data.author,
      content: data.content.map(group => ({
        heading: group.heading,
        body: RichText.asText(group.body),
      })),
    },
  };

  console.log(JSON.stringify(post, null, 2));

  return {
    props: { post },
  };
};
