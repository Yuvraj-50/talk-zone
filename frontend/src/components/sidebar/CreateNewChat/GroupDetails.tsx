import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { useAuthStore } from "../../../zustand/authStore";
import useWebSocketStore from "../../../zustand/socketStore";
import { ChatMembers, CHATTYPE } from "../../../types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useCreateChat from "@/hooks/use-createchat";
import useLoadersStore from "@/zustand/loaderStore";

interface GroupDetailsProps {
  memberList: ChatMembers[];
  setMemberList: Dispatch<SetStateAction<ChatMembers[]>>;
  setIsPopOverOpen: Dispatch<SetStateAction<boolean>>;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

function GroupDetails({
  memberList,
  setMemberList,
  setIsPopOverOpen,
}: GroupDetailsProps) {
  const [groupName, setGroupName] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);
  const socket = useWebSocketStore((state) => state.socket);
  const setLoading = useLoadersStore((state) => state.setLoading);
  const { createChat } = useCreateChat();

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return "Please upload a valid image file (JPEG, PNG, GIF, or WebP)";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 5MB";
    }
    return null;
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          const base64String = reader.result.split(",")[1];
          resolve(base64String);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setPreviewUrl(null);
    setProfilePicture(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      e.target.value = "";
      return;
    }

    try {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      const base64String = await convertFileToBase64(file);
      setProfilePicture(base64String);
    } catch (error) {
      setError("Error processing image. Please try again.");
      console.error("Error reading file:", error);
    }
  };

  async function handleCreateGroup(e: ChangeEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!socket || !user) return;

    try {
      setError(null);

      if (memberList.length === 0) {
        setError("Please add at least one member to the group");
        return;
      }
      setLoading("CREATE_CHAT", true);
      const updatedMemberList = [
        ...memberList,
        {
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
        },
      ];

      createChat(
        updatedMemberList,
        CHATTYPE.GROUPCHAT,
        profilePicture,
        groupName
      );

      setMemberList([]);
      setGroupName("");
      setProfilePicture(null);
      setPreviewUrl(null);
      setIsPopOverOpen(false);
      e.target.reset();
    } catch (error) {
      setError("Failed to create group. Please try again.");
      console.error("Error creating group:", error);
    }
  }

  const cleanupPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  useEffect(() => {
    return () => cleanupPreview();
  }, [previewUrl]);

  return (
    <form onSubmit={handleCreateGroup} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="group-name">Enter Group Name</Label>
        <Input
          required
          id="group-name"
          placeholder="eg : class-group"
          value={groupName}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setGroupName(e.target.value)
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-pic">Profile Picture</Label>
        <Input
          id="profile-pic"
          type="file"
          accept={ALLOWED_FILE_TYPES.join(",")}
          onChange={handleFileChange}
        />
        <p className="text-sm text-gray-500">
          Maximum file size: 5MB. Supported formats: JPEG, PNG, GIF, WebP
        </p>
      </div>

      {previewUrl && (
        <div className="mt-4">
          <Label>Preview</Label>
          <div className="relative w-24 h-24 mt-2 rounded-full overflow-hidden">
            <img
              src={previewUrl}
              alt="Profile preview"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      <Button
        className="w-full"
        type="submit"
        disabled={memberList.length === 0}
      >
        "Create Group"
      </Button>
    </form>
  );
}

export default GroupDetails;
