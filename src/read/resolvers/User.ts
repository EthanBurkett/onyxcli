import { Arg, Mutation, Query, Resolver } from "type-graphql";
import User from "../entity/User";

@Resolver()
export default class UserResolver {
  @Query(() => [User])
  users() {
    return User.find();
  }

  @Mutation(() => Boolean)
  async createUser(@Arg("username") username: string) {
    try {
      await User.insert({ username });
    } catch (e) {
      console.log(e);
      return false;
    }
    return true;
  }
}
