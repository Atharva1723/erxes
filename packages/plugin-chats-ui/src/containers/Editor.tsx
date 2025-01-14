import React, { useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
// erxes
import { Alert } from '@erxes/ui/src/utils';
// local
import EditorComponent from '../components/Editor';
import { mutations, queries } from '../graphql';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  chatId: string;
  type?: string;
  reply?: any;
  setReply: (message: any) => void;
};

const EditorContainer = (props: Props) => {
  const { chatId, reply } = props;

  const { loading, error, data, refetch } = useQuery(gql(queries.chatDetail), {
    variables: { id: chatId }
  });
  const [addMutation] = useMutation(gql(mutations.chatMessageAdd));

  useEffect(() => {
    refetch();
  }, [chatId]);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    Alert.error(error.message);
  }

  const { participantUsers = [] } = data?.chatDetail || {};
  const mentions = [] as any;
  participantUsers &&
    participantUsers.map((user: any) => {
      mentions.push({
        id: user?._id,
        username: user?.details?.fullName,
        avatar: user?.details?.avatar
      });
    });

  const sendMessage = (variables, callback: () => void) => {
    const { attachments, mentionedUserIds, content } = variables;
    let defaultContent = content;

    if (!(content || mentionedUserIds || attachments)) {
      return;
    }

    if (!content) {
      defaultContent = '<p></p>';
    }
    const relatedId = (reply && reply._id) || null;

    addMutation({
      variables: {
        content: defaultContent,
        chatId,
        relatedId,
        attachments,
        mentionedUserIds
      },
      refetchQueries: [
        { query: gql(queries.chats) },
        { query: gql(queries.chatMessages), variables: { chatId } }
      ]
    })
      .then(() => {
        callback();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  return (
    <EditorComponent {...props} sendMessage={sendMessage} mentions={mentions} />
  );
};

export default EditorContainer;
