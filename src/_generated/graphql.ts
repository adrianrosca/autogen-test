
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


export type GQLUser = {
  id: string;
  name: string;
};

export type GQLQuery = {
  users: Array<GQLUser>;
  user: GQLUser;
};

export type GQLMutation = {
  createUser: GQLUser;
  updateUser: GQLUser;
  deleteUser: boolean;
};



export type GQLQueryResolvers<ContextType = unknown, ParentType = unknown> = {
  users?: Resolver<Array<GQLUser>, ParentType, ContextType, Record<string, never>>,
  user?: Resolver<GQLUser, ParentType, ContextType, { id: string }>,
};

export type GQLMutationResolvers<ContextType = unknown, ParentType = unknown> = {
  createUser?: Resolver<GQLUser, ParentType, ContextType, { name: string }>,
  updateUser?: Resolver<GQLUser, ParentType, ContextType, { id: string, name: string }>,
  deleteUser?: Resolver<boolean, ParentType, ContextType, { id: string }>,
};


export type GQLResolvers<ContextType = unknown> = {
  Query?: GQLQueryResolvers<ContextType>;
  Mutation?: GQLMutationResolvers<ContextType>;
};
