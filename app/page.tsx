import type { NextPage } from 'next';
import Head from 'next/head';
import { ChakraProvider, Container, Heading, Text, Link, VStack } from '@chakra-ui/react';
import SelfAttentionVisualization from '@/components/attention';

const Home: NextPage = () => {
  const title = "Self-Attention Mechanism Visualization";
  const description = "Interactive visualization of self-attention in Transformers. Explore and understand how self-attention works in neural nets.";
  const author = "Jaber Jaber";
  const url = "https://jaber.blog/";

  return (
    <ChakraProvider>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="author" content={author} />
        <link rel="icon" href="/favicon.ico" />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content="https://jaber.blog/og-image.jpg" />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={url} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content="https://jaber.blog/twitter-image.jpg" />

        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="self-attention, transformers, machine learning, visualization, neural networks" />
        <link rel="canonical" href={url} />
      </Head>

      <Container maxW="container.xl" py={10}>
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="2xl" textAlign="center">
            {title}
          </Heading>
          <Text fontSize="xl" textAlign="center">
            {description}
          </Text>
          <SelfAttentionVisualization />
          <Text textAlign="center">
            Created with &lt;3 by {author} - {' '}
            <Link href="https://github.com/yourusername/repo-name" isExternal color="blue.500">
              View on GitHub
            </Link>
          </Text>
        </VStack>
      </Container>
    </ChakraProvider>
  );
};

export default Home;