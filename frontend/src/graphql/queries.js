import { gql } from "@apollo/client";

export const GET_BOOKS = gql`
  query GetBooks($page: Int!, $limit: Int!) {
    paginatedBooks(page: $page, limit: $limit) {
      id
      title
      author
      category
      status
    }
  }
`;
