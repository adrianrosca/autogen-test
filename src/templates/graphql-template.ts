export const graphqlTemplate = `
import type { GraphQLResolveInfo } from 'graphql';

export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;

export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type Resolver<TResult, TParent = unknown, TContext = unknown, TArgs = unknown> = 
  ResolverFn<TResult, TParent, TContext, TArgs>;

export type ResolverTypeWrapper<T> = Promise<T> | T;

{{TYPES}}

{{RESOLVERS}}

export type GQLResolvers<ContextType = unknown> = {
  {{RESOLVER_TYPES}}
};
`;

export const typeTemplate = `
export type GQL{{TYPE_NAME}} = {
  {{TYPE_FIELDS}}
};
`;

export const resolverTemplate = `
export type GQL{{TYPE_NAME}}Resolvers<ContextType = unknown, ParentType = unknown> = {
  {{RESOLVER_FIELDS}}
};
`;
