import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import {
  json,
  unstable_createFileUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";

import { CONTENTS_DIR } from "~/utils/contents";

export const loader: LoaderFunction = async () => {
  return json(
    {
      meta: {
        status: 405,
        errorCode: "METHOD_NOT_ALLOWED",
      },
    },
    405
  );
};

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json(
      {
        meta: {
          status: 405,
          errorCode: "METHOD_NOT_ALLOWED",
        },
      },
      405
    );
  }
  const url = new URL(request.url);
  const assetId = url.searchParams.get("assetId");
  if (!assetId) {
    return json(
      {
        meta: {
          status: 400,
          errorCode: "MISSING_ASSET_ID",
        },
      },
      400
    );
  }
  const uploadHandler = unstable_createFileUploadHandler({
    maxPartSize: 5 * 1024 * 1024 * 1024,
    directory: CONTENTS_DIR + "/video",
    file: () => `${assetId}.mp4`,
  });
  try {
    const formData = await unstable_parseMultipartFormData(
      request,
      uploadHandler
    );
    const file = formData.get("file");
    if (!file) {
      return json(
        {
          meta: {
            status: 400,
            errorCode: "MISSING_FILE",
          },
        },
        400
      );
    }
    return json(
      {
        meta: {
          status: 200,
        },
        data: {
          assetId: assetId,
        },
      },
      200
    );
  } catch (error) {
    return json(
      {
        meta: {
          status: 500,
          errorCode: "UPLOAD_FAILED",
        },
      },
      500
    );
  }
};
