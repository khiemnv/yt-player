// MeditationPage.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Link,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

const STORAGE_KEY = "tmh_cycles";

const DEFAULT_CYCLES = Array.from({ length: 16 }, (_, i) => ({
  id: i + 1,
  name: `Chu kỳ ${i + 1}`,
  videoUrl: "",
  videoTitle: "",
  meditationContent: "",
}));

const raw = `B. Các Đề Mục Quán Của Các Chu Kỳ
Chu kì 1
* Đề mục quán giúp tăng thượng tâm, tăng thượng trí:

1. Nhận biết lòng tin nội tâm của mình yếu hay mạnh

- Yếu: Không tin vào gì cả, ít có niềm tin, trong tâm còn nghi ngờ nhưng không có cách giải quyết, bị phiền não.

- Mạnh: Ai nói cũng tin, dễ tin vào sai lầm, ít phản biện, nếu phản biện thì phản biện do bản ngã, bất thiện, lấn lướt.

- Thanh tịnh: Tin có thẩm sát.

2. Kiểm tra tài sản của mình qua dấu hiệu của lòng tin

- Lòng tin của người có trí (mang đến nhiều hạnh phúc, ít phiền não, quả báo tốt): Khi có sự việc thì có tìm hiểu, có thẩm sát trước khi đặt niềm tin vào người, sự việc, hiện tượng.

- Lòng tin của người mê lầm (mang đến nhiều đau khổ, phiền não, quả báo xấu): do sân, tham, ác hại mà tin; dễ tin khi nghe, khi thấy; không tìm hiểu, tư duy, thẩm sát.

3. Hướng đến sửa đổi lòng tin bằng trí tuệ, chánh Pháp, đem đến hạnh phúc cho mình và số đông trong kiếp này và kiếp sau.

4. Tri ân 

a. Tri ân Phật, Tam Bảo; tri ân chư vị Tổ sư đã giữ gìn, nối tiếp Phật Pháp; tri ân chư Tăng hiện tiền, Sư Phụ, chư Tăng chùa Ba Vàng đã giáo dưỡng cho chúng ta; tri ân bạn đồng tu, các bậc thiện hữu tri thức đã tạo các duyên khiến ta tu tập.

b. Tri ân tất cả mọi người: cha mẹ, anh em,...; lãnh đạo đất nước,... bảo vệ Tổ quốc, an ninh...; các chư vị hộ Pháp đã trợ giúp cho chúng ta các thiện duyên tu tập và trong cuộc sống này.

c. Nguyện mong chánh Pháp trụ lâu dài, tất cả chư vị mà ta đã tri ân được tăng trưởng phúc duyên, tiếp tục hộ trì cho mình và chúng sinh được tu theo chánh Pháp Phật, sau được thành Phật.

Chu kì 2
* Đề mục quán giúp tăng thượng tâm, tăng thượng trí:

Quán sát các biểu hiện trong tâm để nhận biết mình có lòng tin thanh tịnh hay chưa?

1. Quan sát biểu hiện của tâm ưa thấy người có giới hạnh qua các việc:

- Thích thân cận với người hướng mình tới điều thiện, thích thân cận người khuyên mình bỏ ác làm lành, thích thân cận với người sách tấn cho mình tu tập, thích thân cận với người chỉ lỗi để mình sửa.

- Ưa nghe diệu Pháp: Thích nghe giảng Phật Pháp, thích đọc tụng kinh để hiểu nghĩa kinh, hiểu lời Phật dạy.

2. Quán sát biểu hiện của tâm mình: tâm ly cấu uế, xan tham, sống trong nhà, bố thí rộng rãi với bàn tay sạch sẽ qua bố thí hướng tới đoạn trừ tham sân, cầu vô thượng Bồ Đề không? Vật bố thí có thanh tịnh không?

3. Ưa thích từ bỏ: Sẵn sàng được yêu cầu. Ví dụ: Khi có người yêu cầu bố thí thì có sẵn sàng không? Có đồ ăn ngon nghĩ đến cha mẹ, hướng đến cúng dường không? Mua quần áo ấm có nghĩ tới cha mẹ không?...

4. Hướng tâm mình để có 3 biểu hiện đó trong tâm của mình.

5. Tri ân

a. Tri ân Phật, Tam Bảo; tri ân chư vị Tổ sư đã giữ gìn, nối tiếp Phật Pháp; tri ân chư Tăng hiện tiền, Sư Phụ, chư Tăng chùa Ba Vàng đã giáo dưỡng cho chúng ta; tri ân bạn đồng tu, các bậc thiện hữu tri thức đã tạo các duyên khiến ta tu tập.

b. Tri ân tất cả mọi người: cha mẹ, anh em,...; lãnh đạo đất nước,... bảo vệ Tổ quốc, an ninh...; các chư vị hộ Pháp đã trợ giúp cho chúng ta các thiện duyên tu tập và trong cuộc sống này.

c. Nguyện mong chánh Pháp trụ lâu dài, tất cả chư vị mà ta đã tri ân được tăng trưởng phúc duyên, tiếp tục hộ trì cho mình và chúng sinh được tu theo chánh Pháp Phật, sau được thành Phật.

Chu kì 3
* Đề mục quán giúp tăng thượng tâm, tăng thượng trí:

1. Quán chiếu lại các sự việc đã tin sai lầm và tư duy để loại trừ sự dễ tin, vội tin trong các tình huống: vội tin vì nghe theo truyền thuyết, truyền thống, lý luận siêu hình; vội tin vì đúng theo một lập trường, phù hợp với định kiến; vội tin vì xuất phát từ uy quyền, vị Sa-môn, tu sĩ nói ra.

2. Tập tư duy để có được lòng tin chân chánh, thanh tịnh từ ngoại cảnh:

Tư duy các khổ của mình trong hiện tại bằng kiến thức nhân quả; tư duy các mong cầu của mình bằng cách gieo nhân thiện để điều chỉnh mong cầu theo sức tinh tấn hiện tại của mình và tăng trưởng sự nỗ lực tinh tấn.

3. Tri ân

a. Tri ân Phật, Tam Bảo; tri ân chư vị Tổ sư đã giữ gìn, nối tiếp Phật Pháp; tri ân chư Tăng hiện tiền, Sư Phụ, chư Tăng chùa Ba Vàng đã giáo dưỡng cho chúng ta; tri ân bạn đồng tu, các bậc thiện hữu tri thức đã tạo các duyên khiến ta tu tập.

b. Tri ân tất cả mọi người: cha mẹ, anh em,...; lãnh đạo đất nước,... bảo vệ Tổ quốc, an ninh...; các chư vị hộ Pháp đã trợ giúp cho chúng ta các thiện duyên tu tập và trong cuộc sống này.

c. Nguyện mong chánh Pháp trụ lâu dài, tất cả chư vị mà ta đã tri ân được tăng trưởng phúc duyên, tiếp tục hộ trì cho mình và chúng sinh được tu theo chánh Pháp Phật, sau được thành Phật.

Chu kì 4
* Đề mục quán giúp tăng thượng tâm, tăng thượng trí:

1. Quán tưởng về những người làm lợi cho số đông như vua Trần Nhân Tông.

2. Hướng tâm tinh tấn để thực tập các Pháp để hướng tới lòng tin thanh tịnh.

3. Tri ân Tam Bảo, tri ân thập phương Tăng, tri ân Sư Phụ, chư Tăng cùng các bậc thiện hữu tri thức đã cho mình các nhân duyên tu tập chính Pháp như ngày hôm nay.

4. Hồi hướng nguyện cầu chánh Pháp trụ lâu dài ở thế gian; hồi hướng cho pháp giới chúng sinh sớm giác ngộ Phật Pháp, tinh tấn tu hành, được an vui, hạnh phúc; hồi hướng cho các mong cầu của bản thân; hồi hướng cho tứ chúng chùa Ba Vàng, CLB Cúc Vàng được tinh tấn tu tập, chuyển tải Phật Pháp, tinh tấn thực hành công hạnh Bồ đề cầu vô thượng Bồ đề.

5. Tri ân

a. Tri ân Phật, Tam Bảo; tri ân chư vị Tổ sư đã giữ gìn, nối tiếp Phật Pháp; tri ân chư Tăng hiện tiền, Sư Phụ, chư Tăng chùa Ba Vàng đã giáo dưỡng cho chúng ta; tri ân bạn đồng tu, các bậc thiện hữu tri thức đã tạo các duyên khiến ta tu tập.

b. Tri ân tất cả mọi người: cha mẹ, anh em,...; lãnh đạo đất nước,... bảo vệ Tổ quốc, an ninh...; các chư vị hộ Pháp đã trợ giúp cho chúng ta các thiện duyên tu tập và trong cuộc sống này.

c. Nguyện mong chánh Pháp trụ lâu dài, tất cả chư vị mà ta đã tri ân được tăng trưởng phúc duyên, tiếp tục hộ trì cho mình và chúng sinh được tu theo chánh Pháp Phật, sau được thành Phật.`;

const rawVideos = `B. Link Các Video Nghe Pháp
Chu kỳ 1

Lòng tin và lợi ích của việc đặt lòng tin nơi Tam Bảo | Chu kỳ 1 - Chương trình tu mùa hạ 2026

Chu kỳ 2

Xây dựng lòng tin thanh tịnh | Chu kỳ 2 - Chương trình tu mùa hạ 2026

Chu kỳ 3

Tiêu chí để xây dựng lòng tin | Chu kỳ 3 - Chương trình tu mùa hạ 2026`;

parseCycles(raw).forEach((cycle) => {
  const obj = DEFAULT_CYCLES.find((c) => c.id === cycle.id);
  if (obj) {
    obj.meditationContent = cycle.meditationContent;
  }
});

parseVideoTitles(rawVideos).forEach((video) => {
  const obj = DEFAULT_CYCLES.find((c) => c.id === video.id);
  if (obj) {
    obj.videoTitle = video.videoTitle;
  }
});

const PRE_MEDITATION_TEMPLATE = `
1. Văn Bạch Trước Khi Ngồi Thiền

Nam mô Phật Bổn Sư Thích Ca Mâu Ni! Giờ này chúng con xin thỉnh chư vị trong cõi tâm linh hữu duyên với chúng con trong chương trình tu mùa hạ, mà chúng con đã bạch thỉnh từ (các) hôm trước [và các hương linh (tùy duyên mời)...], giờ này được tùy duyên ngồi thiền cùng chúng con. Chúng con xin được sự gia hộ, để chúng con thực tập thiền quán được lợi ích.

Hôm nay chúng con xin ngồi thiền quán (tiếp) theo các đề mục quán của chu kỳ {cycleName} theo bài Pháp {videoTitle} Nam mô Phật Bổn Sư Thích Ca Mâu Ni!

2. Văn Bạch Xả Thiền

Nam mô Phật Bổn Sư Thích Ca Mâu Ni! Đệ tử chúng con xin xả thiền (và xin tu quán các đề mục còn lại vào buổi sau).

Chúng con thành kính tri ân Tam Bảo, tri ân Sư Phụ cùng đại Tăng và các bậc thiện hữu tri thức đã hộ trì cho chúng con tu tập công đức này.

Chúng con xin hồi hướng công đức về Vô Thượng Bồ Đề và xin hồi hướng cho các chúng trong cõi tâm linh mà chúng con đã thỉnh mời được tăng trưởng phước lành, kết duyên pháp lữ với các Phật tử trong câu lạc bộ Cúc Vàng, cùng nương tựa Tam Bảo trợ duyên cho nhau tu hành cho tới ngày thành Phật.

Chúng con lại xin hồi hướng cầu an (tu nhóm: và xin mỗi người tự bạch)...

[Xin nghỉ tu thì bạch: Và cũng xin cáo bạch với chư vị, vì nhân duyên… nên chúng con xin được nghỉ tu (cho tới ngày…/cho tới bao giờ đủ duyên thì sẽ bạch tu tiếp)... Chúng con xin chư vị hoan hỷ cho].

Nam mô Phật Bổn Sư Thích Ca Mâu Ni! (1 lễ/vái)
`;
export function renderTemplate(template, variables = {}) {
  const parts = template.split(/(\{[^}]+\})/g);

  return parts.map((part, index) => {
    const match = part.match(/^\{([^}]+)\}$/);

    if (!match) {
      return <React.Fragment key={index}>{part}</React.Fragment>;
    }

    const key = match[1];
    const value = variables[key];

    return (
      <Box
        key={index}
        component="span"
        sx={{
          bgcolor: "warning.light",
          px: 1,
          py: 0.25,
          borderRadius: 1,
          fontWeight: 700,
          mx: 0.5,
        }}
      >
        {value || part}
      </Box>
    );
  });
}
function parseCycles(text) {
  const result = [];
  if (text.match(/^B. Các Đề Mục Quán Của Các Chu Kỳ/)) {
    const regex = /Chu k[ìi]\s*(\d+)([\s\S]*?)(?=Chu k[ìi]\s*\d+|$)/gi;

    let match;

    while ((match = regex.exec(text)) !== null) {
      result.push({
        id: Number(match[1]),
        meditationContent: match[2].trim(),
      });
    }
  }

  return result;
}
function parseVideoTitles(text) {
  const result = [];
  let lines = text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  if (text.match(/^B. Link Các Video Nghe Pháp/)) {
    const regex = /^Chu kỳ\s*(\d+)$/i;

    let match;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if ((match = regex.exec(line)) !== null) {
        const id = Number(match[1]);

        const title = lines[i + 1] || "";

        result.push({
          id,
          videoTitle: title,
        });
      }
    }
  }
  return result;
}
export default function MeditationPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cycles, setCycles] = useState(DEFAULT_CYCLES);

  const [selectDialogOpen, setSelectDialogOpen] = useState(false);

  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const [importText, setImportText] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        setCycles(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cycles));
  }, [cycles]);

  useEffect(() => {
    if (!id) {
      setSelectDialogOpen(true);
    }
  }, [id]);

  const selectedCycle = useMemo(() => {
    const cycleId = Number(id);

    return cycles.find((item) => item.id === cycleId) || cycles[0];
  }, [cycles, id]);

  const prayerContent = renderTemplate(PRE_MEDITATION_TEMPLATE, {
    cycleName: selectedCycle.id,
    videoTitle: selectedCycle.videoTitle || "...",
  });

  const updateCycle = (field, value) => {
    setCycles((prev) =>
      prev.map((cycle) =>
        cycle.id === selectedCycle.id
          ? {
              ...cycle,
              [field]: value,
            }
          : cycle,
      ),
    );
  };

  const importCycles = () => {
    const videos = parseVideoTitles(importText);

    const parsed = parseCycles(importText);

    //   console.log("Parsed cycles:", parsed);
    //   console.log("Parsed videos:", videos);

    if (!parsed.length && !videos.length) {
      alert("Không tìm thấy dữ liệu chu kỳ.");
      return;
    }

    setCycles((prev) => {
      const updated = [...prev];

      videos.forEach((video) => {
        const index = updated.findIndex((c) => c.id === video.id);

        if (index >= 0) {
          updated[index] = {
            ...updated[index],
            videoTitle: video.videoTitle,
          };
        }
      });

      parsed.forEach((item) => {
        const index = updated.findIndex((c) => c.id === item.id);

        if (index >= 0) {
          updated[index] = {
            ...updated[index],
            meditationContent: item.meditationContent,
          };
        } else {
          updated.push({
            id: item.id,
            name: `Chu kỳ ${item.id}`,
            videoUrl: "",
            meditationContent: item.meditationContent,
          });
        }
      });

      return updated;
    });

    setImportDialogOpen(false);
    setImportText("");

    alert(`Đã cập nhật ${parsed.length + videos.length} chu kỳ`);
  };


  const isValidUrl = (value) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const handleVideoPaste = (
  e
) => {
  const html = e.clipboardData.getData("text/html");
  const text = e.clipboardData.getData("text/plain").trim();

  // Case 1: Hyperlink (title + url)
  if (html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const anchor = doc.querySelector("a[href]");

    if (anchor) {
      e.preventDefault();

      updateCycle("videoUrl", anchor.href);

      // nếu muốn lưu title riêng
      updateCycle(
        "videoTitle",
        anchor.textContent?.trim() || anchor.href
      );

      return;
    }
  }

  // Case 2: URL thuần
  if (isValidUrl(text)) {
    e.preventDefault();
    updateCycle("videoUrl", text);
    return;
  }

  // Case 3: Text thường
  // cho TextField xử lý mặc định hoặc:
  e.preventDefault();
  updateCycle("videoTitle", text);
};

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        p: 2,
      }}
    >
      <Dialog open={selectDialogOpen} maxWidth="xs" fullWidth>
        <DialogTitle>Chọn chu kỳ</DialogTitle>

        <DialogContent>
          <List>
            {cycles.map((cycle) => (
              <ListItemButton
                key={cycle.id}
                onClick={() => {
                  setSelectDialogOpen(false);

                  navigate(`/tmh/${cycle.id}`);
                }}
              >
                <ListItemText primary={cycle.name} />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      <Dialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Nhập dữ liệu chu kỳ</DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={20}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Dán toàn bộ nội dung từ website..."
            sx={{ mt: 1 }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Hủy</Button>

          <Button variant="contained" onClick={importCycles}>
            Phân tích & Cập nhật
          </Button>
        </DialogActions>
      </Dialog>

      <Typography variant="h4" gutterBottom>
        Thiền Quán Tu Mùa Hạ 2026
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
        }}
      >
        <Button variant="contained" onClick={() => setImportDialogOpen(true)}>
          Nhập dữ liệu
        </Button>

        <Button
          color="error"
          variant="outlined"
          onClick={() => {
            setCycles(DEFAULT_CYCLES);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CYCLES));
          }}
        >
          Reset
        </Button>
      </Box>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Chọn chu kỳ</InputLabel>

        <Select
          value={selectedCycle.id}
          label="Chọn chu kỳ"
          onChange={(e) => navigate(`/tmh/${e.target.value}`)}
        >
          {cycles.map((cycle) => (
            <MenuItem key={cycle.id} value={cycle.id}>
              {cycle.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Văn Bạch
          </Typography>

          <Typography
            component="pre"
            sx={{
              whiteSpace: "pre-wrap",
              fontFamily: "inherit",
              lineHeight: 1.8,
            }}
          >
            {prayerContent}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Link Video
          </Typography>

          {/* Title input:
              - Hiển thị nếu chưa có title
              - Hoặc nếu đã có url (để nhập nốt title)
              => đảm bảo trường hợp chỉ có url hoặc chỉ có title đều có chỗ nhập tiếp
          */}
          {(selectedCycle?.videoUrl) && (
            <TextField
              sx={{ mb: 2 }}
              label="Tiêu đề video"
              fullWidth
              value={selectedCycle?.videoTitle || ""}
              onChange={(e) => updateCycle("videoTitle", e.target.value)}
            />
          )}

          {/* URL input: luôn hiển thị */}
          <TextField
            label="Video URL"
            fullWidth
            value={selectedCycle?.videoUrl || ""}
            onChange={(e) => updateCycle("videoUrl", e.target.value)}
            onPaste={handleVideoPaste}
          />

          {/* Link mở video: chỉ hiển thị khi có URL */}
          {selectedCycle?.videoUrl && (
            <Box mt={1}>
              <Link
                href={selectedCycle.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
              >
                Mở video
              </Link>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Nội dung thiền quán
          </Typography>

          <TextField
            fullWidth
            multiline
            minRows={20}
            value={selectedCycle.meditationContent}
            onChange={(e) => updateCycle("meditationContent", e.target.value)}
          />
        </CardContent>
      </Card>
    </Box>
  );
}
