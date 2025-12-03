shared_chat_create_message
payload jsonb, chat_id uuid
jsonb
Invoker

BEGIN
  INSERT INTO public."messages" (
    "chatID",
    sender,
    content
  )
  VALUES (
    chat_id,
    (payload ->> 'sender')::uuid,
    (payload ->> 'content')::text
  );
  RETURN payload;
END;



shared_chat_view_message
reservation_id uuid
SETOF jsonb
Invoker

BEGIN
    RETURN QUERY
    SELECT 
        jsonb_build_object(
            'chatID', chat_room."chatID",
            'reservationID', chat_room."reservationID",
            'messagesDetail', chat_room.messages
        )
    
    FROM (
        SELECT 
            c."chatID",
            c."reservationID",
            jsonb_agg(
                jsonb_build_object(
                    'content', m."content",
                    'sender', m."sender",
                    'created_at', m.created_at,
                    'read', m.read 
                )
                ORDER BY m."created_at"
            ) AS messages
        FROM public."messages" m
        JOIN public.chats c ON c."chatID" = m."chatID" 
        GROUP BY c."chatID", c."reservationID"
    ) AS chat_room
    WHERE reservation_id = chat_room."reservationID";
END;



admin_chat_inbox
admin_id uuid
SETOF jsonb
Invoker
    SELECT
        jsonb_build_object(
            'chatID', c."chatID",
            'reservationID', c."reservationID",
            'customer_name', p."displayName", -- Asumsi Anda JOIN dengan tabel profiles untuk nama
            'last_message', sub.last_content,
            'last_sent_at', sub.last_created_at,
            'unread_count', sub.unread_count
        )
    FROM public.chats c
    -- Mengambil pesan terakhir & hitungan belum dibaca
    JOIN (
        SELECT
            "chatID",
            MAX(created_at) AS last_created_at,
            (SELECT content FROM public.messages WHERE "chatID" = m."chatID" ORDER BY created_at DESC LIMIT 1) AS last_content,
            -- Hitung pesan yang belum dibaca OLEH Admin (bukan pesan Admin)
            COUNT(CASE WHEN m.read = FALSE AND m.sender IS DISTINCT FROM admin_chat_inbox.admin_id THEN 1 END) AS unread_count
        FROM public.messages m
        GROUP BY "chatID"
    ) sub ON sub."chatID" = c."chatID"
    
    -- JOIN dengan tabel profiles (asumsi profiles(userID) menyimpan nama customer)
    -- Asumsi: c."reservationID" di tabel chats juga merujuk ke ID customer yang membuat reservasi
    JOIN public.profiles p ON p."userID" = (SELECT "reservationID" FROM public.reservations WHERE "reservationID" = c."reservationID") 

    ORDER BY sub.last_created_at DESC;

shared_chat_mark_as_read
chat_id uuid, viewer_user_id uuid
void
Invoker

BEGIN
    -- Memperbarui kolom 'read' menjadi TRUE untuk semua pesan
    -- di chat tertentu (chat_id) yang BELUM dibaca (read = false)
    -- dan TIDAK dikirim oleh viewer (sender != viewer_user_id)
    UPDATE public.messages
    SET
        read = TRUE,
        updated_at = now()
    WHERE
        "chatID" = shared_chat_mark_as_read.chat_id
        AND sender IS DISTINCT FROM shared_chat_mark_as_read.viewer_user_id
        AND read = FALSE;

    RETURN;
END;
