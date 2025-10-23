import { useState, useEffect } from 'react';

interface ManualPost {
  id: number;
  content: string;
  post_hash: string;
  external_id: string | null;
  account_id: number;
  account_type: string;
  type: string;
  attachments: Array<{
    ext: string;
    mime: string;
    name: string;
    path: string;
    size: number;
    type: string;
    old_path: string;
    converted: boolean;
    url: string;
  }>;
  post_options: Record<string, any>;
  shortened_links: any[];
  error: string | null;
  source: string | null;
  user_id: number;
  user_name: string;
  publish_at: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  published: boolean;
  permalink: string | null;
  draft: boolean;
  approved: boolean;
  reject_reason: string | null;
  insights: any;
  can_edit: boolean;
  can_approve: boolean;
}

interface ManualPostsResponse {
  items: ManualPost[];
  currentPage: number;
  lastPage: number;
  nextPage: number | null;
  total: number;
}

export const useManualPosts = () => {
  const [posts, setPosts] = useState<ManualPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    nextPage: null as number | null,
    total: 0
  });

  // Sample data - replace with actual API call
  const sampleData: ManualPostsResponse = {
    "items": [
      {
        "id": 6056457,
        "content": "Caption",
        "post_hash": "05fc52c5abcfd14285b0addca6a415b358dbc596c3e55b311e4311351feea6ab",
        "external_id": null,
        "account_id": 151371,
        "account_type": "Instagram Business",
        "type": "video",
        "attachments": [
          {
            "ext": "mp4",
            "mime": "video/mp4",
            "name": "138656_1761213036_9sh3anv7rs1rladcfuipu8rgwpgmo0vdxxtwmsxl8c1d64bdcb9bcfaca16468d14c35fa81c8b7db16.",
            "path": "attachments/converted_URauyxxSQAZpIurA_138656_151371_1761213065_nF5Zqt2l6KaGN7y6oPA67CldFYJc0PwM6fRxoeUP2e70de7e3281668b4d1b5527ecbdaf059f47dc19.mp4",
            "size": 32351537,
            "type": "mp4",
            "old_path": "attachments/138656_151371_1761213065_nF5Zqt2l6KaGN7y6oPA67CldFYJc0PwM6fRxoeUP2e70de7e3281668b4d1b5527ecbdaf059f47dc19.mp4",
            "converted": true,
            "url": "https://socialbu.nyc3.digitaloceanspaces.com/attachments/converted_URauyxxSQAZpIurA_138656_151371_1761213065_nF5Zqt2l6KaGN7y6oPA67CldFYJc0PwM6fRxoeUP2e70de7e3281668b4d1b5527ecbdaf059f47dc19.mp4?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=C25SFMRLFBQD2SIWBCWS%2F20251023%2Fnyc3%2Fs3%2Faws4_request&X-Amz-Date=20251023T095538Z&X-Amz-SignedHeaders=host&X-Amz-Expires=86400&X-Amz-Signature=99bd2896c3477b123ebc1697ea501ff8d6040b80804770ed840b8b76b5af6f07"
          }
        ],
        "post_options": {},
        "shortened_links": [],
        "error": null,
        "source": null,
        "user_id": 138656,
        "user_name": "Shawheen Nabizadeh",
        "publish_at": "2025-10-23 11:50:00",
        "created_at": "2025-10-23 09:51:06",
        "updated_at": "2025-10-23 09:51:26",
        "published_at": null,
        "published": false,
        "permalink": null,
        "draft": false,
        "approved": true,
        "reject_reason": null,
        "insights": null,
        "can_edit": true,
        "can_approve": false
      },
      {
        "id": 6056458,
        "content": "Test User 123",
        "post_hash": "44179fe3f5caaaa1ff9f61d142eb657e23cb5525661f19e0c04225a4c04e4e97",
        "external_id": null,
        "account_id": 151372,
        "account_type": "LinkedIn Profile",
        "type": "video",
        "attachments": [
          {
            "ext": "mp4",
            "mime": "video/mp4",
            "name": "138656_1761213036_9sh3anv7rs1rladcfuipu8rgwpgmo0vdxxtwmsxl8c1d64bdcb9bcfaca16468d14c35fa81c8b7db16.",
            "path": "attachments/converted_OH1fRNQQZEE4t9Zp_138656_151372_1761213068_nqp9SWsiDuTSqbpr3Twb199MGF1Z5pyj76tbuxQ1e6c3100b773cef7ff28ceb2a783653c2630f306c.mp4",
            "size": 32351537,
            "type": "mp4",
            "old_path": "attachments/138656_151372_1761213068_nqp9SWsiDuTSqbpr3Twb199MGF1Z5pyj76tbuxQ1e6c3100b773cef7ff28ceb2a783653c2630f306c.mp4",
            "converted": true,
            "url": "https://socialbu.nyc3.digitaloceanspaces.com/attachments/converted_OH1fRNQQZEE4t9Zp_138656_151372_1761213068_nqp9SWsiDuTSqbpr3Twb199MGF1Z5pyj76tbuxQ1e6c3100b773cef7ff28ceb2a783653c2630f306c.mp4?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=C25SFMRLFBQD2SIWBCWS%2F20251023%2Fnyc3%2Fs3%2Faws4_request&X-Amz-Date=20251023T095538Z&X-Amz-SignedHeaders=host&X-Amz-Expires=86400&X-Amz-Signature=4f99fddb8d667e8bf7fdd00971399346441710c0f3be402c0a4dac15ac5e8b19"
          }
        ],
        "post_options": {},
        "shortened_links": [],
        "error": null,
        "source": null,
        "user_id": 138656,
        "user_name": "Shawheen Nabizadeh",
        "publish_at": "2025-10-23 11:50:00",
        "created_at": "2025-10-23 09:51:09",
        "updated_at": "2025-10-23 09:51:44",
        "published_at": null,
        "published": false,
        "permalink": null,
        "draft": false,
        "approved": true,
        "reject_reason": null,
        "insights": null,
        "can_edit": true,
        "can_approve": false
      },
      {
        "id": 6032218,
        "content": "Caption",
        "post_hash": "bac72880fba0ae3f74956ee298b3412590107d083dd843dc672b300f587df788",
        "external_id": null,
        "account_id": 148312,
        "account_type": "X (Twitter) Account",
        "type": "video",
        "attachments": [
          {
            "ext": "mp4",
            "mime": "video/mp4",
            "name": "138656_1761044036_1dmsxjwvdgtzmrkg7r5aj1pkr7893fgp1wyvyzc2d054080da824b93837a56a9f9f21eeef78538557.",
            "path": "attachments/converted_6Mdz6RF6yuwy24Zw_138656_148312_1761044042_pjc01TJNLUQuP6ebwvHkm8SYl4WpqYZBuwIUadLXbe42693b2b069eef773374166006961c184d3c78.mp4",
            "size": 15581150,
            "type": "mp4",
            "old_path": "attachments/138656_148312_1761044042_pjc01TJNLUQuP6ebwvHkm8SYl4WpqYZBuwIUadLXbe42693b2b069eef773374166006961c184d3c78.mp4",
            "converted": true,
            "url": "https://socialbu.nyc3.digitaloceanspaces.com/attachments/converted_6Mdz6RF6yuwy24Zw_138656_148312_1761044042_pjc01TJNLUQuP6ebwvHkm8SYl4WpqYZBuwIUadLXbe42693b2b069eef773374166006961c184d3c78.mp4?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=C25SFMRLFBQD2SIWBCWS%2F20251023%2Fnyc3%2Fs3%2Faws4_request&X-Amz-Date=20251023T095538Z&X-Amz-SignedHeaders=host&X-Amz-Expires=86400&X-Amz-Signature=50167327801e52d96f3a91ac2731b64e560818ea36567dcabf523dfabefb733f"
          }
        ],
        "post_options": {},
        "shortened_links": [],
        "error": null,
        "source": null,
        "user_id": 138656,
        "user_name": "Shawheen Nabizadeh",
        "publish_at": "2025-10-29 13:53:00",
        "created_at": "2025-10-21 10:54:03",
        "updated_at": "2025-10-21 10:54:38",
        "published_at": null,
        "published": false,
        "permalink": null,
        "draft": false,
        "approved": true,
        "reject_reason": null,
        "insights": null,
        "can_edit": true,
        "can_approve": false
      },
      {
        "id": 6032219,
        "content": "Caption",
        "post_hash": "28d641349392b8e9ccc6d48abed8ede5e932f15f0799140af1db2e76484688ef",
        "external_id": null,
        "account_id": 151222,
        "account_type": "TikTok Account",
        "type": "video",
        "attachments": [
          {
            "ext": "mp4",
            "mime": "video/mp4",
            "name": "138656_1761044036_1dmsxjwvdgtzmrkg7r5aj1pkr7893fgp1wyvyzc2d054080da824b93837a56a9f9f21eeef78538557.",
            "path": "attachments/converted_Yh6QIjzBwabQYAg2_138656_151222_1761044046_G8aS4ZylO5uzrB63W2qB0KizIEXSuPm8d0fKi6pSe62fc1b9eb2d4b0a36ce7c370bca29e246098da6.mp4",
            "size": 15581150,
            "type": "mp4",
            "old_path": "attachments/138656_151222_1761044046_G8aS4ZylO5uzrB63W2qB0KizIEXSuPm8d0fKi6pSe62fc1b9eb2d4b0a36ce7c370bca29e246098da6.mp4",
            "converted": true,
            "url": "https://socialbu.nyc3.digitaloceanspaces.com/attachments/converted_Yh6QIjzBwabQYAg2_138656_151222_1761044046_G8aS4ZylO5uzrB63W2qB0KizIEXSuPm8d0fKi6pSe62fc1b9eb2d4b0a36ce7c370bca29e246098da6.mp4?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=C25SFMRLFBQD2SIWBCWS%2F20251023%2Fnyc3%2Fs3%2Faws4_request&X-Amz-Date=20251023T095538Z&X-Amz-SignedHeaders=host&X-Amz-Expires=86400&X-Amz-Signature=b190ae677aa22c104b8b872dcf3958148979b24576bd1abdae3f0805da8a634b"
          }
        ],
        "post_options": {
          "privacy_status": "PUBLIC_TO_EVERYONE"
        },
        "shortened_links": [],
        "error": null,
        "source": null,
        "user_id": 138656,
        "user_name": "Shawheen Nabizadeh",
        "publish_at": "2025-10-29 13:53:00",
        "created_at": "2025-10-21 10:54:06",
        "updated_at": "2025-10-21 10:54:41",
        "published_at": null,
        "published": false,
        "permalink": null,
        "draft": false,
        "approved": true,
        "reject_reason": null,
        "insights": null,
        "can_edit": true,
        "can_approve": false
      },
      {
        "id": 6032220,
        "content": "Caption",
        "post_hash": "6858a35237a9e50d4c2d6f83a5b26b3fcc831c6ca4dd2ff2d7f6ebc2c8a07e5f",
        "external_id": null,
        "account_id": 151387,
        "account_type": "YouTube Channel",
        "type": "video",
        "attachments": [
          {
            "ext": "mp4",
            "mime": "video/mp4",
            "name": "138656_1761044036_1dmsxjwvdgtzmrkg7r5aj1pkr7893fgp1wyvyzc2d054080da824b93837a56a9f9f21eeef78538557.",
            "path": "attachments/converted_9G8NXccaVDpFp2l6_138656_151387_1761044048_tzb194O3NG7d6EDApM9xLYfQd1coZcPJJOpiXZzI010704d9e145e07b68886a2f7324ba31ac96ffbc.mp4",
            "size": 15581150,
            "type": "mp4",
            "old_path": "attachments/138656_151387_1761044048_tzb194O3NG7d6EDApM9xLYfQd1coZcPJJOpiXZzI010704d9e145e07b68886a2f7324ba31ac96ffbc.mp4",
            "converted": true,
            "url": "https://socialbu.nyc3.digitaloceanspaces.com/attachments/converted_9G8NXccaVDpFp2l6_138656_151387_1761044048_tzb194O3NG7d6EDApM9xLYfQd1coZcPJJOpiXZzI010704d9e145e07b68886a2f7324ba31ac96ffbc.mp4?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=C25SFMRLFBQD2SIWBCWS%2F20251023%2Fnyc3%2Fs3%2Faws4_request&X-Amz-Date=20251023T095538Z&X-Amz-SignedHeaders=host&X-Amz-Expires=86400&X-Amz-Signature=04291eabdfbee3c823e3ac9df7d391cbafbf0d1e0eccf3431f8500209bcf7e12"
          }
        ],
        "post_options": {
          "privacy_status": "public"
        },
        "shortened_links": [],
        "error": null,
        "source": null,
        "user_id": 138656,
        "user_name": "Shawheen Nabizadeh",
        "publish_at": "2025-10-29 13:53:00",
        "created_at": "2025-10-21 10:54:08",
        "updated_at": "2025-10-21 10:54:48",
        "published_at": null,
        "published": false,
        "permalink": null,
        "draft": false,
        "approved": true,
        "reject_reason": null,
        "insights": null,
        "can_edit": true,
        "can_approve": false
      }
    ],
    "currentPage": 1,
    "lastPage": 1,
    "nextPage": null,
    "total": 5
  };

  const fetchManualPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use sample data for now
      setPosts(sampleData.items);
      setPagination({
        currentPage: sampleData.currentPage,
        lastPage: sampleData.lastPage,
        nextPage: sampleData.nextPage,
        total: sampleData.total
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch manual posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManualPosts();
  }, []);

  return {
    posts,
    loading,
    error,
    pagination,
    refetch: fetchManualPosts
  };
};
